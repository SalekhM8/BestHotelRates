import React, { Suspense } from 'react';
import { SearchContent } from './SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f5f5]">
        <div className="bg-[#5DADE2] py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="h-14 bg-white/20 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-56 aspect-square bg-gray-200 rounded" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-10 bg-gray-200 rounded w-32 ml-auto mt-4" />
                  </div>
                </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
