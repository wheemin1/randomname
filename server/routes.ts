import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNicknameCheckSchema, insertGeneratedNicknameSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Nickname check endpoint
  app.post("/api/nickname-check", async (req, res) => {
    try {
      const { nicknames } = z.object({
        nicknames: z.array(z.string()).max(100),
      }).parse(req.body);

      const results = await Promise.all(
        nicknames.map(async (nickname) => {
          const cleanNickname = nickname.trim();
          if (!cleanNickname) return null;

          // Check cache first
          const cached = await storage.getNicknameCheck(cleanNickname);
          if (cached) {
            return {
              nickname: cleanNickname,
              status: cached.status,
              lastChecked: cached.lastChecked,
            };
          }

          // Return loading state for new checks
          return {
            nickname: cleanNickname,
            status: "loading",
            lastChecked: new Date(),
          };
        })
      );

      res.json(results.filter(Boolean));
    } catch (error) {
      console.error("Nickname check error:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Update nickname status (called by Netlify function)
  app.post("/api/nickname-status", async (req, res) => {
    try {
      const { nickname, status } = z.object({
        nickname: z.string(),
        status: z.enum(["free", "busy", "error"]),
      }).parse(req.body);

      const ttl = new Date();
      ttl.setHours(ttl.getHours() + 12); // 12 hour TTL

      const existing = await storage.getNicknameCheck(nickname);
      if (existing) {
        const updated = await storage.updateNicknameCheck(nickname, status, ttl);
        res.json(updated);
      } else {
        const created = await storage.createNicknameCheck({
          nickname,
          status,
          ttl,
        });
        res.json(created);
      }
    } catch (error) {
      console.error("Nickname status update error:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Generate nicknames endpoint
  app.post("/api/generate-nicknames", async (req, res) => {
    try {
      const { length, count, type, options } = z.object({
        length: z.number().min(2).max(6),
        count: z.number().min(1).max(20),
        type: z.enum(["random", "korean", "pure", "english"]),
        options: z.object({
          excludeFinalConsonants: z.boolean().optional(),
          specificInitial: z.string().optional(),
        }).optional(),
      }).parse(req.body);

      // Store generation request
      const generated = await storage.createGeneratedNickname({
        nickname: `generated_${Date.now()}`,
        length,
        type,
        options: options || {},
      });

      // Return configuration for frontend to handle generation
      res.json({
        id: generated.id,
        length,
        count,
        type,
        options: options || {},
      });
    } catch (error) {
      console.error("Generate nicknames error:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Get generated nicknames history
  app.get("/api/generated-nicknames", async (req, res) => {
    try {
      const nicknames = await storage.getGeneratedNicknames(50);
      res.json(nicknames);
    } catch (error) {
      console.error("Get generated nicknames error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
