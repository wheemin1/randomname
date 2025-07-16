import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { nicknameApi, externalApi } from "../lib/api";
import { GeneratedNickname, GenerationOptions } from "../types/nickname";
import { koreanUtils } from "../lib/korean-utils";
import { useToast } from "./use-toast";

export function useNicknameGeneration() {
  const [generatedNicknames, setGeneratedNicknames] = useState<GeneratedNickname[]>([]);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (options: GenerationOptions) => {
      const { length, count, useRealWords, wordType, excludeFinalConsonants, specificInitial } = options;

      let candidates: string[] = [];

      if (useRealWords) {
        // Get real words from dictionary
        try {
          const words = await externalApi.getDictionaryWords({
            length,
            type: wordType,
            count: count * 3, // Get more to filter
          });
          
          candidates = koreanUtils.filterWords(words, {
            excludeFinalConsonants,
            specificInitial,
          });
        } catch (error) {
          console.error("Dictionary error:", error);
          toast({
            title: "사전 오류",
            description: "사전에서 단어를 가져오는 중 오류가 발생했습니다. 랜덤 생성으로 전환합니다.",
            variant: "destructive",
          });
        }
      }

      // If no real words or fallback to random
      if (candidates.length === 0) {
        candidates = Array.from({ length: count * 2 }, () => {
          let nickname = koreanUtils.generateRandomSyllables(length);
          
          // Apply filters
          if (excludeFinalConsonants) {
            while (koreanUtils.hasAnyFinalConsonant(nickname)) {
              nickname = koreanUtils.generateRandomSyllables(length);
            }
          }
          
          if (specificInitial) {
            while (!koreanUtils.startsWithInitial(nickname, specificInitial)) {
              nickname = koreanUtils.generateRandomSyllables(length);
            }
          }
          
          return nickname;
        });
      }

      // Shuffle and take requested count
      const shuffled = candidates.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, count);

      // Check availability for each generated nickname
      const results: GeneratedNickname[] = selected.map(nickname => ({
        nickname,
        status: "loading" as const,
        type: useRealWords ? wordType : "random",
        options: {
          length,
          excludeFinalConsonants,
          specificInitial,
        },
      }));

      setGeneratedNicknames(results);

      // Check availability in background
      results.forEach(async (result, index) => {
        try {
          const status = await externalApi.checkNicknameAvailability(result.nickname);
          
          setGeneratedNicknames(prev => 
            prev.map((item, i) => 
              i === index 
                ? { ...item, status }
                : item
            )
          );
        } catch (error) {
          console.error(`Error checking generated nickname ${result.nickname}:`, error);
          setGeneratedNicknames(prev => 
            prev.map((item, i) => 
              i === index 
                ? { ...item, status: "error" as const }
                : item
            )
          );
        }
      });

      return results;
    },
    onSuccess: () => {
      toast({
        title: "생성 완료",
        description: "닉네임이 생성되었습니다.",
      });
    },
    onError: (error) => {
      console.error("Generation error:", error);
      toast({
        title: "생성 실패",
        description: error instanceof Error ? error.message : "닉네임 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const clearGenerated = useCallback(() => {
    setGeneratedNicknames([]);
  }, []);

  return {
    generatedNicknames,
    isGenerating: generateMutation.isPending,
    generateNicknames: generateMutation.mutate,
    clearGenerated,
    error: generateMutation.error,
  };
}
