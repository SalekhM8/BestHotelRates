const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

type Counter = { count: number; resetAt: number };
const memoryCounters: Map<string, Counter> = new Map();

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

async function incrRedis(key: string) {
  return redisCommand<number>(['INCR', key]);
}

async function pexpireRedis(key: string, ttlMs: number) {
  return redisCommand(['PEXPIRE', key, ttlMs]);
}

async function enforceRedisLimit(key: string, limit: number, windowMs: number) {
  const count = await incrRedis(key);
  if (count === 1) {
    await pexpireRedis(key, windowMs);
  }
  return { allowed: (count ?? 0) <= limit, remaining: Math.max(0, limit - (count ?? 0)) };
}

function enforceMemoryLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = memoryCounters.get(key);
  if (!entry || entry.resetAt <= now) {
    memoryCounters.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  entry.count += 1;
  const allowed = entry.count <= limit;
  memoryCounters.set(key, entry);
  return { allowed, remaining: Math.max(0, limit - entry.count) };
}

export async function enforceRateLimit(key: string, limit: number, windowMs: number) {
  if (isRedisAvailable()) {
    return enforceRedisLimit(key, limit, windowMs);
  }
  return enforceMemoryLimit(key, limit, windowMs);
}


