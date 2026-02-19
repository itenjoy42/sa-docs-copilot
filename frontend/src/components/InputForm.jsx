import React from 'react';

/**
 * InputForm 컴포넌트
 * 사용자로부터 프로젝트 정보를 입력받는 폼
 * Requirements: 1.1, 1.2, 1.3, 1.4, 6.1
 */
function InputForm({ formData, onChange, onSubmit, errors }) {
  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  // 입력 필드 변경 핸들러
  const handleChange = (field) => (e) => {
    onChange(field, e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 보안 경고 문구 (Requirement 6.1) */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>보안 주의:</strong> 고객 정보, 계정 정보 등 민감한 데이터를 입력하지 마세요.
            </p>
          </div>
        </div>
      </div>

      {/* 프로젝트 요약 (Requirement 1.1) */}
      <div>
        <label htmlFor="projectSummary" className="block text-sm font-medium text-gray-700 mb-2">
          프로젝트 요약 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="projectSummary"
          value={formData.projectSummary}
          onChange={handleChange('projectSummary')}
          rows={4}
          className={`w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.projectSummary ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="프로젝트의 목적, 배경, 주요 목표를 간략히 설명해주세요."
        />
        {errors.projectSummary && (
          <p className="mt-2 text-sm text-red-600">{errors.projectSummary}</p>
        )}
      </div>

      {/* 핵심 요구사항 (Requirement 1.1) */}
      <div>
        <label htmlFor="coreRequirements" className="block text-sm font-medium text-gray-700 mb-2">
          핵심 요구사항 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="coreRequirements"
          value={formData.coreRequirements}
          onChange={handleChange('coreRequirements')}
          rows={4}
          className={`w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.coreRequirements ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="프로젝트의 주요 기능 요구사항과 제약사항을 나열해주세요."
        />
        {errors.coreRequirements && (
          <p className="mt-2 text-sm text-red-600">{errors.coreRequirements}</p>
        )}
      </div>

      {/* 문서 톤 및 산출물 타입 - 반응형 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 문서 톤 (Requirement 1.1) */}
        <div>
          <label htmlFor="documentTone" className="block text-sm font-medium text-gray-700 mb-2">
            문서 톤 <span className="text-red-500">*</span>
          </label>
          <select
            id="documentTone"
            value={formData.documentTone}
            onChange={handleChange('documentTone')}
            className={`w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.documentTone ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="formal">공식적</option>
            <option value="technical">기술적</option>
            <option value="concise">간결함</option>
          </select>
          {errors.documentTone && (
            <p className="mt-2 text-sm text-red-600">{errors.documentTone}</p>
          )}
        </div>

        {/* 산출물 타입 (Requirement 1.2) */}
        <div>
          <label htmlFor="deliverableType" className="block text-sm font-medium text-gray-700 mb-2">
            산출물 타입 <span className="text-red-500">*</span>
          </label>
          <select
            id="deliverableType"
            value={formData.deliverableType}
            onChange={handleChange('deliverableType')}
            className={`w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.deliverableType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="type1">아키텍처 설계서</option>
            <option value="type2">기술 제안서</option>
            <option value="type3">마이그레이션 계획서</option>
          </select>
          {errors.deliverableType && (
            <p className="mt-2 text-sm text-red-600">{errors.deliverableType}</p>
          )}
        </div>
      </div>

      {/* 제출 버튼 (Requirement 1.3) */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="btn-primary w-full sm:w-auto"
        >
          산출물 생성
        </button>
      </div>
    </form>
  );
}

export default InputForm;
