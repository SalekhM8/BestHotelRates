import React, { Suspense } from 'react';
import { PaymentSuccessContent } from './PaymentSuccessContent';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5DADE2] mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your booking...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
