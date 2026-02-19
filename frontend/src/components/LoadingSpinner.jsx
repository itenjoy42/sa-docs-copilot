import React from 'react';

/**
 * LoadingSpinner 컴포넌트
 * 로딩 상태를 표시하는 스피너 애니메이션
 */
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* 스피너 애니메이션 */}
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      
      {/* 로딩 텍스트 */}
      <p className="mt-4 text-blue-600 font-medium">처리 중...</p>
    </div>
  );
}

export default LoadingSpinner;
