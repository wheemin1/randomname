import { useState } from "react";
import { Settings, CheckCircle, XCircle, Clock } from "lucide-react";
import { NicknameInput } from "../components/nickname-input";
import { GenerateModal } from "../components/generate-modal";
import { ResultsList } from "../components/results-list";
import { SavedNicknames } from "../components/saved-nicknames";
import { useNicknameCheck } from "../hooks/use-nickname-check";

export default function Home() {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const { results, isLoading, checkNicknames, clearCache } = useNicknameCheck();

  const handleCheck = (nicknames: string[]) => {
    checkNicknames(nicknames);
  };

  const handleGenerate = () => {
    setIsGenerateModalOpen(true);
  };

  const handleClearCache = () => {
    clearCache();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/favicon.png" 
                alt="MapleStory Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <h1 className="text-xl font-bold text-gray-900">메이플 닉네임 생성기</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  <span>사용 가능</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="w-4 h-4 text-red-500 mr-1" />
                  <span>사용 중</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                  <span>확인 중</span>
                </div>
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">메이플스토리 닉네임 체크 & 생성</h2>
            <p className="text-xl text-blue-100 mb-8">최대 100개 닉네임을 동시에 확인하고, 원하는 조건으로 생성해보세요</p>
          </div>
          
          <NicknameInput
            onCheck={handleCheck}
            onGenerate={handleGenerate}
            onClearCache={handleClearCache}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Results Section */}
          <div className="lg:col-span-4">
            <ResultsList 
              results={results} 
              lastUpdate={results.length > 0 ? new Date() : undefined}
            />
          </div>

          {/* Saved Nicknames Sidebar */}
          <div className="lg:col-span-1">
            <SavedNicknames />
          </div>
        </div>
      </main>

      {/* Generate Modal */}
      <GenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-40">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">닉네임을 확인하는 중...</p>
          </div>
        </div>
      )}
      
      {/* Nexon API Attribution */}
      <footer className="bg-gray-800 text-white py-2 text-center text-xs">
        <p>Data based on NEXON Open API</p>
      </footer>
    </div>
  );
}
