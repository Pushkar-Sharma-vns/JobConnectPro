import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertJobSchema, insertApplicationSchema, insertAgencyCandidateSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

// Middleware to verify JWT token
async function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Middleware to check user role
function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      // Return user data (without password) and token
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      // Return user data (without password) and token
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs({ status: "active" });
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", authenticateToken, requireRole(['company', 'agency']), async (req: any, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData, req.user.id, req.user.role);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.get("/api/my-jobs", authenticateToken, requireRole(['company', 'agency']), async (req: any, res) => {
    try {
      const jobs = await storage.getJobs({ postedById: req.user.id });
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.put("/api/jobs/:id", authenticateToken, requireRole(['company', 'agency']), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      if (job.postedById !== req.user.id) {
        return res.status(403).json({ message: "You can only edit your own jobs" });
      }

      const updates = req.body;
      const updatedJob = await storage.updateJob(id, updates);
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  // Application routes
  app.post("/api/applications", authenticateToken, requireRole(['candidate']), async (req: any, res) => {
    try {
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        candidateId: req.user.id,
      });

      // Check if user already applied to this job
      const existingApplications = await storage.getApplications({
        jobId: applicationData.jobId,
        candidateId: req.user.id,
      });

      if (existingApplications.length > 0) {
        return res.status(400).json({ message: "You have already applied to this job" });
      }

      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.get("/api/my-applications", authenticateToken, requireRole(['candidate']), async (req: any, res) => {
    try {
      const applications = await storage.getApplications({ candidateId: req.user.id });
      
      // Enrich applications with job data
      const enrichedApplications = await Promise.all(
        applications.map(async (app) => {
          const job = await storage.getJob(app.jobId);
          return { ...app, job };
        })
      );
      
      res.json(enrichedApplications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get("/api/job-applications/:jobId", authenticateToken, requireRole(['company', 'agency']), async (req: any, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      if (job.postedById !== req.user.id) {
        return res.status(403).json({ message: "You can only view applications for your own jobs" });
      }

      const applications = await storage.getApplications({ jobId });
      
      // Enrich applications with candidate data
      const enrichedApplications = await Promise.all(
        applications.map(async (app) => {
          const candidate = await storage.getUser(app.candidateId);
          const { password, ...candidateWithoutPassword } = candidate || {};
          return { ...app, candidate: candidateWithoutPassword };
        })
      );
      
      res.json(enrichedApplications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job applications" });
    }
  });

  app.put("/api/applications/:id", authenticateToken, requireRole(['company', 'agency']), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const application = await storage.getApplication(id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns the job this application is for
      const job = await storage.getJob(application.jobId);
      if (!job || job.postedById !== req.user.id) {
        return res.status(403).json({ message: "You can only update applications for your own jobs" });
      }

      const updates = req.body;
      const updatedApplication = await storage.updateApplication(id, updates);
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Agency candidate routes
  app.get("/api/agency-candidates", authenticateToken, requireRole(['agency']), async (req: any, res) => {
    try {
      const candidates = await storage.getAgencyCandidates(req.user.id);
      
      // Enrich with user data
      const enrichedCandidates = await Promise.all(
        candidates.map(async (candidate) => {
          const user = await storage.getUser(candidate.candidateId);
          const { password, ...userWithoutPassword } = user || {};
          return { ...candidate, candidate: userWithoutPassword };
        })
      );
      
      res.json(enrichedCandidates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agency candidates" });
    }
  });

  app.post("/api/agency-candidates", authenticateToken, requireRole(['agency']), async (req: any, res) => {
    try {
      const candidateData = insertAgencyCandidateSchema.parse(req.body);
      const agencyCandidate = await storage.createAgencyCandidate(candidateData, req.user.id);
      res.status(201).json(agencyCandidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add candidate to agency" });
    }
  });

  // Stats routes
  app.get("/api/stats/candidate", authenticateToken, requireRole(['candidate']), async (req: any, res) => {
    try {
      const stats = await storage.getCandidateStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch candidate stats" });
    }
  });

  app.get("/api/stats/company", authenticateToken, requireRole(['company']), async (req: any, res) => {
    try {
      const stats = await storage.getCompanyStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company stats" });
    }
  });

  app.get("/api/stats/agency", authenticateToken, requireRole(['agency']), async (req: any, res) => {
    try {
      const stats = await storage.getAgencyStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agency stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
