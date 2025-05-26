import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const userRoleEnum = ["candidate", "company", "agency"] as const;

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").$type<typeof userRoleEnum[number]>().notNull(),
  companyName: text("company_name"), // For company users
  agencyName: text("agency_name"), // For agency users
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  department: text("department"),
  employmentType: text("employment_type").notNull(),
  experienceLevel: text("experience_level").notNull(),
  location: text("location"),
  remoteWork: text("remote_work").notNull(),
  skills: text("skills"), // Comma-separated skills
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  deadline: timestamp("deadline"),
  status: text("status").default("active").notNull(),
  postedById: integer("posted_by_id").notNull(),
  postedByType: text("posted_by_type").notNull(), // 'company' or 'agency'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Job applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'reviewed', 'interview', 'rejected', 'hired'
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  interviewDate: timestamp("interview_date"),
  notes: text("notes"),
});

// Agency candidates table (for agencies to manage their candidate pool)
export const agencyCandidates = pgTable("agency_candidates", {
  id: serial("id").primaryKey(),
  agencyId: integer("agency_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  specialization: text("specialization"),
  experience: text("experience"),
  rating: integer("rating").default(0),
  status: text("status").default("available").notNull(), // 'available', 'placed', 'interviewing'
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// User profiles table
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  bio: text("bio"),
  skills: text("skills"), // Comma-separated skills
  experience: text("experience"),
  education: text("education"),
  location: text("location"),
  resumeUrl: text("resume_url"),
  portfolioUrl: text("portfolio_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  postedById: true,
  postedByType: true,
  status: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
});

export const insertAgencyCandidateSchema = createInsertSchema(agencyCandidates).omit({
  id: true,
  addedAt: true,
  agencyId: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  updatedAt: true,
  userId: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type AgencyCandidate = typeof agencyCandidates.$inferSelect;
export type InsertAgencyCandidate = z.infer<typeof insertAgencyCandidateSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type LoginData = z.infer<typeof loginSchema>;
