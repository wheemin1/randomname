import { useState, useEffect, useCallback } from "react";
import { SavedNickname } from "../types/nickname";
import { localStorageUtils } from "../lib/storage";
import { useToast } from "./use-toast";

export function useSavedNicknames() {
  const [savedNicknames, setSavedNicknames] = useState<SavedNickname[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setSavedNicknames(localStorageUtils.getSavedNicknames());
  }, []);

  const saveNickname = useCallback((nickname: string, status: "free" | "busy" | "loading" | "error", length: number) => {
    // Don't save nicknames with loading status
    if (status === "loading") return;
    
    const savedNickname: SavedNickname = {
      nickname,
      status,
      savedAt: new Date(),
      length,
    };
    
    localStorageUtils.saveNickname(savedNickname);
    setSavedNicknames(localStorageUtils.getSavedNicknames());
    
    toast({
      title: "닉네임 저장됨",
      description: `"${nickname}"이(가) 저장되었습니다.`,
    });
  }, [toast]);

  const removeSavedNickname = useCallback((nickname: string) => {
    localStorageUtils.removeSavedNickname(nickname);
    setSavedNicknames(localStorageUtils.getSavedNicknames());
    
    toast({
      title: "닉네임 삭제됨",
      description: `"${nickname}"이(가) 삭제되었습니다.`,
    });
  }, [toast]);

  const clearAllSaved = useCallback(() => {
    localStorageUtils.clearSavedNicknames();
    setSavedNicknames([]);
    
    toast({
      title: "모든 저장 삭제됨",
      description: "저장된 모든 닉네임이 삭제되었습니다.",
    });
  }, [toast]);

  const copyToClipboard = useCallback(async (nickname: string) => {
    try {
      await navigator.clipboard.writeText(nickname);
      toast({
        title: "클립보드에 복사됨",
        description: `"${nickname}"이(가) 클립보드에 복사되었습니다.`,
      });
    } catch (error) {
      console.error("Clipboard copy error:", error);
      toast({
        title: "복사 실패",
        description: "클립보드 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    savedNicknames,
    saveNickname,
    removeSavedNickname,
    clearAllSaved,
    copyToClipboard,
  };
}
