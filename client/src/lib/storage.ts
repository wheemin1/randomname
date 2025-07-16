import { SavedNickname } from "../types/nickname";

const STORAGE_KEY = "maple-saved-nicknames";

export const localStorageUtils = {
  getSavedNicknames(): SavedNickname[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored).map((item: any) => ({
        ...item,
        savedAt: new Date(item.savedAt),
      }));
    } catch (error) {
      console.error("Error reading saved nicknames:", error);
      return [];
    }
  },

  saveNickname(nickname: SavedNickname): void {
    try {
      const existing = this.getSavedNicknames();
      const updated = existing.filter(item => item.nickname !== nickname.nickname);
      updated.unshift(nickname);
      
      // Keep only last 50 saved nicknames
      const limited = updated.slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
      console.error("Error saving nickname:", error);
    }
  },

  removeSavedNickname(nickname: string): void {
    try {
      const existing = this.getSavedNicknames();
      const updated = existing.filter(item => item.nickname !== nickname);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error removing saved nickname:", error);
    }
  },

  clearSavedNicknames(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing saved nicknames:", error);
    }
  },
};
