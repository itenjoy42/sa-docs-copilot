import React from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * DraftPreview 컴포넌트
 * 생성된 산출물을 미리보기하고 관리하는 컴포넌트
 * 
 * @param {Object} props
 * @param {string} props.content - Markdown 형식의 산출물 콘텐츠
 * @param {string[]} props.warnings - 품질 경고 메시지 배열
 * @param {Function} props.onSave - 저장 버튼 클릭 핸들러
 * @param {Function} props.onDownload - 다운로드 버튼 클릭 핸들러
 * @param {Function} props.onCopy - 복사 버튼 클릭 핸들러
 * @param {Function} props.onRegenerate - 재생성 버튼 클릭 핸들러
 */
function DraftPreview({ content, warnings = [], onSave, onDownload, onCopy, onRegenerate }) {
  return (
    <div className="card mt-6">
      {/* 헤더 및 액션 버튼 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
          산출물 미리보기
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            저장
          </button>
          
          <button
            onClick={onDownload}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            다운로드
          </button>
          
          <button
            onClick={onCopy}
            className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          >
            복사
          </button>
          
          <button
            onClick={onRegenerate}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            재생성
          </button>
        </div>
      </div>
      
      {/* 품질 경고 메시지 */}
      {warnings.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="font-semibold text-yellow-800 mb-2">
            ⚠️ 품질 경고
          </div>
          {warnings.map((warning, index) => (
            <div key={index} className="ml-5 mt-1 text-yellow-700 text-sm">
              • {warning}
            </div>
          ))}
        </div>
      )}
      
      {/* Markdown 콘텐츠 렌더링 */}
      <div className="p-4 md:p-6 bg-gray-50 rounded-lg border border-gray-200 min-h-[400px] max-h-[800px] overflow-y-auto">
        <ReactMarkdown
          components={{
            // 제목 스타일링
            h1: ({node, children, ...props}) => <h1 className="text-2xl md:text-3xl font-bold mt-6 mb-4 text-gray-900" {...props}>{children}</h1>,
            h2: ({node, children, ...props}) => <h2 className="text-xl md:text-2xl font-semibold mt-5 mb-3 text-gray-800" {...props}>{children}</h2>,
            h3: ({node, children, ...props}) => <h3 className="text-lg md:text-xl font-semibold mt-4 mb-2 text-gray-800" {...props}>{children}</h3>,
            
            // 단락 스타일링
            p: ({node, children, ...props}) => <p className="mb-3 leading-relaxed text-gray-700" {...props}>{children}</p>,
            
            // 리스트 스타일링
            ul: ({node, children, ...props}) => <ul className="ml-5 mb-3 list-disc text-gray-700" {...props}>{children}</ul>,
            ol: ({node, children, ...props}) => <ol className="ml-5 mb-3 list-decimal text-gray-700" {...props}>{children}</ol>,
            li: ({node, children, ...props}) => <li className="mb-1.5 leading-relaxed" {...props}>{children}</li>,
            
            // 코드 블록 스타일링
            code: ({node, inline, children, ...props}) => 
              inline 
                ? <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                : <code className="block bg-gray-200 p-3 rounded-md text-sm font-mono overflow-x-auto" {...props}>{children}</code>,
            
            // 인용구 스타일링
            blockquote: ({node, children, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 ml-0 text-gray-600 italic" {...props}>{children}</blockquote>,
            
            // 테이블 스타일링
            table: ({node, children, ...props}) => <table className="w-full border-collapse mb-4" {...props}>{children}</table>,
            th: ({node, children, ...props}) => <th className="border border-gray-300 px-2 py-1.5 bg-gray-100 text-left text-sm" {...props}>{children}</th>,
            td: ({node, children, ...props}) => <td className="border border-gray-300 px-2 py-1.5 text-sm" {...props}>{children}</td>,
            
            // 링크 스타일링
            a: ({node, children, ...props}) => <a className="text-blue-500 hover:text-blue-600 underline" {...props}>{children}</a>
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default DraftPreview;
