const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

type CacheValue = any;

type InflightEntry<T> = {
  promise: Promise<T>;
};

const memoryStore: Map<string, { value: CacheValue; expires: number }> = new Map();
const inflight: Map<string, InflightEntry<any>> = new Map();

function isRedisAvailable() {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}

async function redisCommand<T = any>(command: (string | number)[]): Promise<T | undefined> {
  if (!isRedisAvailable()) return undefined;
  const res = await fetch(UPSTASH_URL as string, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) return undefined;
  const json = await res.json();
  return json?.result as T;
}

async function getFromRedis(key: string) {
  const result = await redisCommand<string>(['GET', key]);
  if (typeof result !== 'string') return undefined;
  try {
    return JSON.parse(result);
  } catch {
    return undefined;
  }
}

async function setInRedis(key: string, value: CacheValue, ttlMs: number) {
  const payload = JSON.stringify(value);
  await redisCommand(['SET', key, payload, 'PX', ttlMs]);
}

function getFromMemory(key: string) {
  const entry = memoryStore.get(key);
  if (!entry) return undefined;
  if (entry.expires < Date.now()) {
    memoryStore.delete(key);
    return undefined;
  }
  return entry.value;
}

function setInMemory(key: string, value: CacheValue, ttlMs: number) {
  memoryStore.set(key, { value, expires: Date.now() + ttlMs });
}

export async function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const existing = await getCached<T>(key);
  if (existing !== undefined) return existing;

  const inflightEntry = inflight.get(key);
  if (inflightEntry) {
    return inflightEntry.promise;
  }

  const promise = fn()
    .then(async (result) => {
      await setCached(key, result, ttlMs);
      return result;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, { promise });
  return promise;
}

export async function getCached<T>(key: string): Promise<T | undefined> {
  if (isRedisAvailable()) {
    const value = await getFromRedis(key);
    if (value !== undefined) return value as T;
  }
  return getFromMemory(key) as T | undefined;
}

export async function setCached(key: string, value: CacheValue, ttlMs: number) {
  if (isRedisAvailable()) {
    await setInRedis(key, value, ttlMs);
  } else {
    setInMemory(key, value, ttlMs);
  }
}

export const cacheInfo = {
  backend: () => (isRedisAvailable() ? 'upstash' : 'memory'),
};



