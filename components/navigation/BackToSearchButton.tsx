'use client';

import { useRouter } from 'next/navigation';

export function BackToSearchButton() {
  const router = useRouter();

  const handleBack = () => {
    // Use browser's back functionality to preserve search state
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      // Fallback to search page if no history
      router.push('/search');
    }
  };

  return (
    <button
      onClick={handleBack}
      className="glass-card-small px-4 py-2.5 text-white font-semibold inline-flex items-center gap-2 text-sm cursor-pointer hover:bg-white/20 transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back to search
    </button>
  );
}

