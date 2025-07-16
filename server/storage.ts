import { users, nicknameChecks, generatedNicknames, type User, type InsertUser, type NicknameCheck, type InsertNicknameCheck, type GeneratedNickname, type InsertGeneratedNickname } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getNicknameCheck(nickname: string): Promise<NicknameCheck | undefined>;
  createNicknameCheck(check: InsertNicknameCheck): Promise<NicknameCheck>;
  updateNicknameCheck(nickname: string, status: string, ttl: Date): Promise<NicknameCheck | undefined>;
  
  createGeneratedNickname(nickname: InsertGeneratedNickname): Promise<GeneratedNickname>;
  getGeneratedNicknames(limit?: number): Promise<GeneratedNickname[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private nicknameChecks: Map<string, NicknameCheck>;
  private generatedNicknames: GeneratedNickname[];
  private currentUserId: number;
  private currentNicknameCheckId: number;
  private currentGeneratedId: number;

  constructor() {
    this.users = new Map();
    this.nicknameChecks = new Map();
    this.generatedNicknames = [];
    this.currentUserId = 1;
    this.currentNicknameCheckId = 1;
    this.currentGeneratedId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getNicknameCheck(nickname: string): Promise<NicknameCheck | undefined> {
    const check = this.nicknameChecks.get(nickname);
    if (check && check.ttl > new Date()) {
      return check;
    }
    return undefined;
  }

  async createNicknameCheck(check: InsertNicknameCheck): Promise<NicknameCheck> {
    const id = this.currentNicknameCheckId++;
    const now = new Date();
    const nicknameCheck: NicknameCheck = {
      id,
      ...check,
      lastChecked: now,
    };
    this.nicknameChecks.set(check.nickname, nicknameCheck);
    return nicknameCheck;
  }

  async updateNicknameCheck(nickname: string, status: string, ttl: Date): Promise<NicknameCheck | undefined> {
    const existing = this.nicknameChecks.get(nickname);
    if (existing) {
      const updated: NicknameCheck = {
        ...existing,
        status: status as "free" | "busy" | "error",
        lastChecked: new Date(),
        ttl,
      };
      this.nicknameChecks.set(nickname, updated);
      return updated;
    }
    return undefined;
  }

  async createGeneratedNickname(nickname: InsertGeneratedNickname): Promise<GeneratedNickname> {
    const id = this.currentGeneratedId++;
    const generated: GeneratedNickname = {
      id,
      ...nickname,
      options: nickname.options || {},
      createdAt: new Date(),
    };
    this.generatedNicknames.push(generated);
    return generated;
  }

  async getGeneratedNicknames(limit = 100): Promise<GeneratedNickname[]> {
    return this.generatedNicknames
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
