import React from 'react';

/**
 * ErrorAlert 컴포넌트
 * 오류 및 경고 메시지를 표시하는 알림 컴포넌트
 * 
 * @param {Object} props
 * @param {string} props.type - 알림 타입 ('error' 또는 'warning')
 * @param {string} props.message - 표시할 메시지
 * @param {Function} props.onClose - 닫기 버튼 클릭 핸들러 (선택적)
 */
function ErrorAlert({ type = 'error', message, onClose }) {
  // 타입에 따른 스타일 설정
  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '❌'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠️'
    }
  };

  const style = styles[type] || styles.error;

  return (
    <div className={`${style.bg} ${style.border} border rounded-lg p-4 mb-4 flex items-start gap-3`}>
      {/* 아이콘 */}
      <span className="text-xl flex-shrink-0">{style.icon}</span>
      
      {/* 메시지 */}
      <div className="flex-1">
        <p className={`${style.text} text-sm`}>{message}</p>
      </div>
      
      {/* 닫기 버튼 (선택적) */}
      {onClose && (
        <button
          onClick={onClose}
          className={`${style.text} hover:opacity-70 transition-opacity flex-shrink-0`}
          aria-label="닫기"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default ErrorAlert;
