import { useState } from 'react';
import InputForm from './components/InputForm';
import DraftPreview from './components/DraftPreview';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorAlert from './components/ErrorAlert';
import * as api from './services/api';

function App() {
  // 전역 상태 관리
  const [formData, setFormData] = useState({
    projectSummary: '',
    coreRequirements: '',
    documentTone: 'formal',
    deliverableType: 'type1'
  });
  
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState([]);

  // 입력 변경 핸들러
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 입력 시 해당 필드의 오류 제거
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 산출물 생성 핸들러
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      setWarnings([]);
      
      // API 호출
      const response = await api.generateDraft(formData);
      setGeneratedDraft(response.draft);
      setWarnings(response.warnings || []);
      
    } catch (error) {
      console.error('산출물 생성 오류:', error);
      
      // 검증 오류 처리
      if (error.validationErrors) {
        setErrors(error.validationErrors);
      } else {
        setErrors({ submit: error.message || '산출물 생성 중 오류가 발생했습니다.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 서버에 저장 핸들러
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // API 호출
      const response = await api.saveDraft({
        content: generatedDraft,
        deliverableType: formData.deliverableType,
        metadata: {
          projectSummary: formData.projectSummary,
          coreRequirements: formData.coreRequirements,
          documentTone: formData.documentTone,
          createdAt: new Date().toISOString()
        }
      });
      
      alert(`산출물이 서버에 저장되었습니다.\n파일명: ${response.filename}`);
      
    } catch (error) {
      console.error('저장 오류:', error);
      alert(error.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 다운로드 핸들러
  const handleDownload = () => {
    try {
      // Blob 생성 및 다운로드
      const blob = new Blob([generatedDraft], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sa-deliverable-${formData.deliverableType}-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('다운로드 오류:', error);
      alert('다운로드 중 오류가 발생했습니다.');
    }
  };

  // 클립보드 복사 핸들러
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedDraft);
      alert('클립보드에 복사되었습니다.');
    } catch (error) {
      console.error('복사 오류:', error);
      alert('복사 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-10 max-w-7xl">
        {/* 헤더 */}
        <header className="mb-8 md:mb-12 flex items-center gap-3">
          <img 
            src="https://www.megazone.com/favicon_BK_120.png" 
            alt="Logo" 
            className="w-10 h-10 md:w-12 md:h-12"
          />
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
            SA 산출물 Co-Pilot
          </h1>
        </header>
        
        {/* 메인 콘텐츠 */}
        <main className="space-y-6">
          <div className="card">
            <h2 className="text-lg md:text-xl font-semibold mb-6 text-gray-800">
              산출물 정보 입력
            </h2>
            
            {/* InputForm 컴포넌트 */}
            <InputForm
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              errors={errors}
            />
            
            {/* 로딩 인디케이터 */}
            {isLoading && <LoadingSpinner />}
            
            {/* 오류 표시 */}
            {Object.keys(errors).length > 0 && errors.submit && (
              <ErrorAlert
                type="error"
                message={errors.submit}
                onClose={() => setErrors({})}
              />
            )}
          </div>
          
          {/* DraftPreview 컴포넌트 - 산출물이 생성되었을 때만 표시 */}
          {generatedDraft && (
            <DraftPreview
              content={generatedDraft}
              warnings={warnings}
              onSave={handleSave}
              onDownload={handleDownload}
              onCopy={handleCopy}
              onRegenerate={handleSubmit}
            />
          )}
        </main>
        
        {/* 푸터 */}
        <footer className="mt-12 md:mt-16 text-center text-gray-600 text-sm">
          made by <a 
            href="https://www.megazone.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:text-blue-600 transition-colors no-underline"
          >
            AIR Code
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
