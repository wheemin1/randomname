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
      console.log('Starting nickname generation with options:', options);
      const { length, count, useRealWords, wordType, excludeFinalConsonants, specificInitial } = options;

      let candidates: string[] = [];

      if (useRealWords) {
        // Get real words from dictionary
        try {
          console.log('Fetching real words from dictionary...');
          const words = await externalApi.getDictionaryWords({
            length,
            type: wordType,
            count: count * 3, // Get more to filter
          });
          
          console.log(`Received ${words.length} words from API:`, words.slice(0, 10));
          
          candidates = koreanUtils.filterWords(words, {
            excludeFinalConsonants,
            specificInitial,
          });
          
          console.log(`Filtered down to ${candidates.length} candidates:`, candidates.slice(0, 10));
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
        console.log('No candidates found, generating random nicknames...');
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
      
      console.log(`Selected ${selected.length} nicknames for availability check:`, selected);

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
          console.log(`Checking availability for: ${result.nickname}`);
          const status = await externalApi.checkNicknameAvailability(result.nickname);
          console.log(`Availability result for ${result.nickname}:`, status);
          
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
