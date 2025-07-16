// Korean text utilities
export const koreanUtils = {
  // Check if character has final consonant (받침)
  hasFinalConsonant(char: string): boolean {
    const code = char.charCodeAt(0);
    if (code < 0xAC00 || code > 0xD7A3) return false;
    return (code - 0xAC00) % 28 !== 0;
  },

  // Check if word has any final consonants
  hasAnyFinalConsonant(word: string): boolean {
    return Array.from(word).some(char => this.hasFinalConsonant(char));
  },

  // Get initial consonant of character
  getInitialConsonant(char: string): string {
    const code = char.charCodeAt(0);
    if (code < 0xAC00 || code > 0xD7A3) return "";
    
    const initial = Math.floor((code - 0xAC00) / 588);
    const initials = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    return initials[initial] || "";
  },

  // Check if word starts with specific initial consonant
  startsWithInitial(word: string, initial: string): boolean {
    if (!word) return false;
    const firstChar = word[0];
    return this.getInitialConsonant(firstChar) === initial;
  },

  // Generate random Korean syllables
  generateRandomSyllables(length: number): string {
    const initials = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    const medials = ["ㅏ", "ㅑ", "ㅓ", "ㅕ", "ㅗ", "ㅛ", "ㅜ", "ㅠ", "ㅡ", "ㅣ", "ㅐ", "ㅒ", "ㅔ", "ㅖ"];
    const finals = ["", "ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    
    let result = "";
    for (let i = 0; i < length; i++) {
      const initial = initials[Math.floor(Math.random() * initials.length)];
      const medial = medials[Math.floor(Math.random() * medials.length)];
      const final = finals[Math.floor(Math.random() * finals.length)];
      
      const syllable = this.composeSyllable(initial, medial, final);
      result += syllable;
    }
    return result;
  },

  // Compose Korean syllable from components
  composeSyllable(initial: string, medial: string, final: string): string {
    const initialIndex = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"].indexOf(initial);
    const medialIndex = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"].indexOf(medial);
    const finalIndex = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"].indexOf(final);
    
    if (initialIndex === -1 || medialIndex === -1 || finalIndex === -1) return "";
    
    const syllableCode = 0xAC00 + (initialIndex * 588) + (medialIndex * 28) + finalIndex;
    return String.fromCharCode(syllableCode);
  },

  // Filter words based on options
  filterWords(words: string[], options: {
    excludeFinalConsonants?: boolean;
    specificInitial?: string;
  }): string[] {
    let filtered = words;
    
    if (options.excludeFinalConsonants) {
      filtered = filtered.filter(word => !this.hasAnyFinalConsonant(word));
    }
    
    if (options.specificInitial) {
      filtered = filtered.filter(word => this.startsWithInitial(word, options.specificInitial!));
    }
    
    return filtered;
  },
};
