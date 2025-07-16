import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nicknameApi, externalApi } from "../lib/api";
import { NicknameResult } from "../types/nickname";
import { useToast } from "./use-toast";

export function useNicknameCheck() {
  const [results, setResults] = useState<NicknameResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const checkMutation = useMutation({
    mutationFn: async (nicknames: string[]) => {
      const cleanNicknames = nicknames
        .map(n => n.trim())
        .filter(n => n.length > 0)
        .slice(0, 100);

      if (cleanNicknames.length === 0) {
        throw new Error("유효한 닉네임을 입력해주세요");
      }

      // Get cached results first
      const cachedResults = await nicknameApi.checkNicknames(cleanNicknames);
      
      // Update local state with initial results
      const initialResults: NicknameResult[] = cachedResults.map(result => ({
        nickname: result.nickname,
        status: result.status,
        lastChecked: new Date(result.lastChecked),
        length: result.nickname.length,
      }));
      
      setResults(initialResults);

      // Check fresh data for loading items
      const loadingItems = initialResults.filter(r => r.status === "loading");
      if (loadingItems.length > 0) {
        // Process in batches to avoid rate limiting
        const batchSize = 3;
        for (let i = 0; i < loadingItems.length; i += batchSize) {
          const batch = loadingItems.slice(i, i + batchSize);
          
          await Promise.all(batch.map(async (item) => {
            try {
              const status = await externalApi.checkNicknameAvailability(item.nickname);
              
              // Update result in state
              setResults(prev => prev.map(r => 
                r.nickname === item.nickname 
                  ? { ...r, status, lastChecked: new Date() }
                  : r
              ));
            } catch (error) {
              console.error(`Error checking ${item.nickname}:`, error);
              setResults(prev => prev.map(r => 
                r.nickname === item.nickname 
                  ? { ...r, status: "error" as const, lastChecked: new Date() }
                  : r
              ));
            }
          }));
          
          // Delay between batches
          if (i + batchSize < loadingItems.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      return initialResults;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nickname-check"] });
      toast({
        title: "검사 완료",
        description: "닉네임 검사가 완료되었습니다.",
      });
    },
    onError: (error) => {
      console.error("Nickname check error:", error);
      toast({
        title: "검사 실패",
        description: error instanceof Error ? error.message : "닉네임 검사 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const clearCache = useCallback(async () => {
    try {
      setResults([]);
      queryClient.invalidateQueries({ queryKey: ["/api/nickname-check"] });
      toast({
        title: "캐시 초기화",
        description: "검사 결과가 초기화되었습니다.",
      });
    } catch (error) {
      console.error("Cache clear error:", error);
      toast({
        title: "초기화 실패",
        description: "캐시 초기화 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  }, [queryClient, toast]);

  return {
    results,
    isLoading: checkMutation.isPending,
    checkNicknames: checkMutation.mutate,
    clearCache,
    error: checkMutation.error,
  };
}
