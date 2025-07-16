import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { GenerationOptions } from "../types/nickname";
import { NicknameChip } from "./nickname-chip";
import { useNicknameGeneration } from "../hooks/use-nickname-generation";
import { useSavedNicknames } from "../hooks/use-saved-nicknames";

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GenerateModal({ isOpen, onClose }: GenerateModalProps) {
  const [options, setOptions] = useState<GenerationOptions>({
    length: 3,
    count: 10,
    useRealWords: false,
    wordType: "korean",
    excludeFinalConsonants: false,
    specificInitial: "",
  });
  
  const [showSpecificInitial, setShowSpecificInitial] = useState(false);
  
  const { generatedNicknames, isGenerating, generateNicknames, clearGenerated } = useNicknameGeneration();
  const { saveNickname, copyToClipboard } = useSavedNicknames();

  const handleGenerate = () => {
    generateNicknames(options);
  };

  const handleSave = (nickname: string, status: "free" | "busy" | "loading" | "error") => {
    // Don't save nicknames that are still loading status
    if (status === "loading") return;
    saveNickname(nickname, status, nickname.length);
  };

  const handleCopy = (nickname: string) => {
    copyToClipboard(nickname);
  };

  const handleClose = () => {
    clearGenerated();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>닉네임 생성하기</DialogTitle>
          <p id="dialog-description" className="sr-only">
            닉네임 생성 옵션을 설정하고 생성할 수 있습니다.
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">기본 설정</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="length">글자 수</Label>
                <Select
                  value={options.length.toString()}
                  onValueChange={(value) => setOptions(prev => ({ ...prev, length: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2글자</SelectItem>
                    <SelectItem value="3">3글자</SelectItem>
                    <SelectItem value="4">4글자</SelectItem>
                    <SelectItem value="5">5글자</SelectItem>
                    <SelectItem value="6">6글자</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="count">생성 개수</Label>
                <Select
                  value={options.count.toString()}
                  onValueChange={(value) => setOptions(prev => ({ ...prev, count: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5개</SelectItem>
                    <SelectItem value="10">10개</SelectItem>
                    <SelectItem value="15">15개</SelectItem>
                    <SelectItem value="20">20개</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Real Word Option */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">실제 단어 사용</h4>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useRealWords"
                  checked={options.useRealWords}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, useRealWords: !!checked }))}
                />
                <Label htmlFor="useRealWords">실제 단어만 생성</Label>
              </div>
            </div>
            
            {options.useRealWords && (
              <div className="mt-3 pl-6">
                <RadioGroup
                  value={options.wordType}
                  onValueChange={(value) => setOptions(prev => ({ ...prev, wordType: value as "korean" | "pure" | "english" }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="korean" id="korean" />
                    <Label htmlFor="korean">한국어</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pure" id="pure" />
                    <Label htmlFor="pure">순우리말(고유어)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="english" id="english" />
                    <Label htmlFor="english">영어</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">고급 옵션</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="excludeFinalConsonants"
                  checked={options.excludeFinalConsonants}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, excludeFinalConsonants: !!checked }))}
                />
                <Label htmlFor="excludeFinalConsonants">받침 제외</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="specificInitial"
                  checked={showSpecificInitial}
                  onCheckedChange={(checked) => {
                    setShowSpecificInitial(!!checked);
                    if (!checked) {
                      setOptions(prev => ({ ...prev, specificInitial: "" }));
                    }
                  }}
                />
                <Label htmlFor="specificInitial">특정 초성으로 시작</Label>
              </div>
              
              {showSpecificInitial && (
                <div className="pl-6">
                  <Select
                    value={options.specificInitial}
                    onValueChange={(value) => setOptions(prev => ({ ...prev, specificInitial: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="초성 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ㄱ">ㄱ</SelectItem>
                      <SelectItem value="ㄴ">ㄴ</SelectItem>
                      <SelectItem value="ㄷ">ㄷ</SelectItem>
                      <SelectItem value="ㄹ">ㄹ</SelectItem>
                      <SelectItem value="ㅁ">ㅁ</SelectItem>
                      <SelectItem value="ㅂ">ㅂ</SelectItem>
                      <SelectItem value="ㅅ">ㅅ</SelectItem>
                      <SelectItem value="ㅇ">ㅇ</SelectItem>
                      <SelectItem value="ㅈ">ㅈ</SelectItem>
                      <SelectItem value="ㅊ">ㅊ</SelectItem>
                      <SelectItem value="ㅋ">ㅋ</SelectItem>
                      <SelectItem value="ㅌ">ㅌ</SelectItem>
                      <SelectItem value="ㅍ">ㅍ</SelectItem>
                      <SelectItem value="ㅎ">ㅎ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Generated Results Preview */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">미리보기</h4>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
              {generatedNicknames.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Plus className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm">생성 버튼을 눌러주세요</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {generatedNicknames.map((nickname, index) => (
                    <NicknameChip
                      key={index}
                      nickname={nickname.nickname}
                      status={nickname.status}
                      length={nickname.nickname.length}
                      onSave={() => handleSave(nickname.nickname, nickname.status)}
                      onCopy={() => handleCopy(nickname.nickname)}
                      showActions={nickname.status !== "loading"}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-primary text-white hover:bg-blue-700"
          >
            {isGenerating ? "생성 중..." : "닉네임 생성"}
          </Button>
          <Button onClick={handleClose} variant="outline">
            취소
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
