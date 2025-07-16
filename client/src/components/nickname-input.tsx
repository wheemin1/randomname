import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, CheckCircle, Plus } from "lucide-react";

interface NicknameInputProps {
  onCheck: (nicknames: string[]) => void;
  onGenerate: () => void;
  onClearCache: () => void;
  isLoading?: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function NicknameInput({
  onCheck,
  onGenerate,
  onClearCache,
  isLoading = false,
}: NicknameInputProps) {
  const [input, setInput] = useState("");
  const debouncedInput = useDebounce(input, 300);

  const nicknames = debouncedInput
    .split(",")
    .map(n => n.trim())
    .filter(n => n.length > 0);

  const handleCheck = useCallback(() => {
    if (nicknames.length > 0) {
      onCheck(nicknames);
    }
  }, [nicknames, onCheck]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCheck();
    }
  }, [handleCheck]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            닉네임 입력 (쉼표로 구분, 최대 100개)
          </label>
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all duration-200"
              rows={4}
              placeholder="예: 루나, 쉔, 아델, 카인..."
              disabled={isLoading}
            />
            <div className="absolute top-2 right-2 text-xs text-gray-400">
              <span className={nicknames.length > 100 ? "text-red-500" : ""}>
                {nicknames.length}
              </span>
              /100
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleCheck}
            disabled={isLoading || nicknames.length === 0 || nicknames.length > 100}
            className="flex-1 bg-primary text-white hover:bg-blue-700 transition-all duration-200"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {isLoading ? "확인 중..." : "닉네임 확인하기"}
          </Button>
          
          <Button
            onClick={onGenerate}
            disabled={isLoading}
            className="bg-secondary text-white hover:bg-purple-700 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            닉네임 생성하기
          </Button>
          
          <Button
            onClick={onClearCache}
            disabled={isLoading}
            variant="outline"
            className="bg-gray-600 text-white hover:bg-gray-700 transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">캐시 새로고침</span>
            <span className="sm:hidden">새로고침</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
