import {
  users,
  jobs,
  applications,
  agencyCandidates,
  profiles,
  type User,
  type InsertUser,
  type Job,
  type InsertJob,
  type Application,
  type InsertApplication,
  type AgencyCandidate,
  type InsertAgencyCandidate,
  type Profile,
  type InsertProfile,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, 'confirmPassword'>): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Job operations
  getJob(id: number): Promise<Job | undefined>;
  getJobs(filters?: { postedById?: number; status?: string }): Promise<Job[]>;
  createJob(job: InsertJob, postedById: number, postedByType: string): Promise<Job>;
  updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;

  // Application operations
  getApplication(id: number): Promise<Application | undefined>;
  getApplications(filters?: { jobId?: number; candidateId?: number }): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined>;

  // Agency candidate operations
  getAgencyCandidate(id: number): Promise<AgencyCandidate | undefined>;
  getAgencyCandidates(agencyId: number): Promise<AgencyCandidate[]>;
  createAgencyCandidate(agencyCandidate: InsertAgencyCandidate, agencyId: number): Promise<AgencyCandidate>;
  updateAgencyCandidate(id: number, updates: Partial<AgencyCandidate>): Promise<AgencyCandidate | undefined>;
  removeAgencyCandidate(id: number): Promise<boolean>;

  // Profile operations
  getProfile(userId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile, userId: number): Promise<Profile>;
  updateProfile(userId: number, updates: Partial<Profile>): Promise<Profile | undefined>;

  // Analytics operations
  getCandidateStats(candidateId: number): Promise<{
    applications: number;
    interviews: number;
    pending: number;
    views: number;
  }>;
  
  getCompanyStats(companyId: number): Promise<{
    activeJobs: number;
    totalApplications: number;
    pendingReviews: number;
    interviews: number;
  }>;

  getAgencyStats(agencyId: number): Promise<{
    candidatePool: number;
    activePlacements: number;
    successfulPlacements: number;
    partnerCompanies: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private jobs: Map<number, Job> = new Map();
  private applications: Map<number, Application> = new Map();
  private agencyCandidates: Map<number, AgencyCandidate> = new Map();
  private profiles: Map<number, Profile> = new Map();
  
  private currentUserId = 1;
  private currentJobId = 1;
  private currentApplicationId = 1;
  private currentAgencyCandidateId = 1;
  private currentProfileId = 1;

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: Omit<InsertUser, 'confirmPassword'>): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Job operations
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobs(filters?: { postedById?: number; status?: string }): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values());
    
    if (filters?.postedById) {
      jobs = jobs.filter(job => job.postedById === filters.postedById);
    }
    
    if (filters?.status) {
      jobs = jobs.filter(job => job.status === filters.status);
    }
    
    return jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createJob(job: InsertJob, postedById: number, postedByType: string): Promise<Job> {
    const id = this.currentJobId++;
    const newJob: Job = {
      ...job,
      id,
      postedById,
      postedByType,
      status: "active",
      createdAt: new Date(),
    };
    this.jobs.set(id, newJob);
    return newJob;
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: number): Promise<boolean> {
    return this.jobs.delete(id);
  }

  // Application operations
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getApplications(filters?: { jobId?: number; candidateId?: number }): Promise<Application[]> {
    let applications = Array.from(this.applications.values());
    
    if (filters?.jobId) {
      applications = applications.filter(app => app.jobId === filters.jobId);
    }
    
    if (filters?.candidateId) {
      applications = applications.filter(app => app.candidateId === filters.candidateId);
    }
    
    return applications.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const id = this.currentApplicationId++;
    const newApplication: Application = {
      ...application,
      id,
      appliedAt: new Date(),
    };
    this.applications.set(id, newApplication);
    return newApplication;
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...updates };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Agency candidate operations
  async getAgencyCandidate(id: number): Promise<AgencyCandidate | undefined> {
    return this.agencyCandidates.get(id);
  }

  async getAgencyCandidates(agencyId: number): Promise<AgencyCandidate[]> {
    return Array.from(this.agencyCandidates.values())
      .filter(candidate => candidate.agencyId === agencyId)
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
  }

  async createAgencyCandidate(agencyCandidate: InsertAgencyCandidate, agencyId: number): Promise<AgencyCandidate> {
    const id = this.currentAgencyCandidateId++;
    const newAgencyCandidate: AgencyCandidate = {
      ...agencyCandidate,
      id,
      agencyId,
      addedAt: new Date(),
    };
    this.agencyCandidates.set(id, newAgencyCandidate);
    return newAgencyCandidate;
  }

  async updateAgencyCandidate(id: number, updates: Partial<AgencyCandidate>): Promise<AgencyCandidate | undefined> {
    const candidate = this.agencyCandidates.get(id);
    if (!candidate) return undefined;
    
    const updatedCandidate = { ...candidate, ...updates };
    this.agencyCandidates.set(id, updatedCandidate);
    return updatedCandidate;
  }

  async removeAgencyCandidate(id: number): Promise<boolean> {
    return this.agencyCandidates.delete(id);
  }

  // Profile operations
  async getProfile(userId: number): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(profile => profile.userId === userId);
  }

  async createProfile(profile: InsertProfile, userId: number): Promise<Profile> {
    const id = this.currentProfileId++;
    const newProfile: Profile = {
      ...profile,
      id,
      userId,
      updatedAt: new Date(),
    };
    this.profiles.set(id, newProfile);
    return newProfile;
  }

  async updateProfile(userId: number, updates: Partial<Profile>): Promise<Profile | undefined> {
    const profile = Array.from(this.profiles.values()).find(p => p.userId === userId);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...updates, updatedAt: new Date() };
    this.profiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  // Analytics operations
  async getCandidateStats(candidateId: number): Promise<{
    applications: number;
    interviews: number;
    pending: number;
    views: number;
  }> {
    const applications = Array.from(this.applications.values()).filter(app => app.candidateId === candidateId);
    
    return {
      applications: applications.length,
      interviews: applications.filter(app => app.status === 'interview').length,
      pending: applications.filter(app => app.status === 'pending' || app.status === 'reviewed').length,
      views: Math.floor(Math.random() * 50) + 10, // Mock view count
    };
  }

  async getCompanyStats(companyId: number): Promise<{
    activeJobs: number;
    totalApplications: number;
    pendingReviews: number;
    interviews: number;
  }> {
    const jobs = Array.from(this.jobs.values()).filter(job => job.postedById === companyId);
    const jobIds = jobs.map(job => job.id);
    const applications = Array.from(this.applications.values()).filter(app => jobIds.includes(app.jobId));
    
    return {
      activeJobs: jobs.filter(job => job.status === 'active').length,
      totalApplications: applications.length,
      pendingReviews: applications.filter(app => app.status === 'pending').length,
      interviews: applications.filter(app => app.status === 'interview').length,
    };
  }

  async getAgencyStats(agencyId: number): Promise<{
    candidatePool: number;
    activePlacements: number;
    successfulPlacements: number;
    partnerCompanies: number;
  }> {
    const candidates = Array.from(this.agencyCandidates.values()).filter(candidate => candidate.agencyId === agencyId);
    
    return {
      candidatePool: candidates.length,
      activePlacements: candidates.filter(candidate => candidate.status === 'interviewing').length,
      successfulPlacements: candidates.filter(candidate => candidate.status === 'placed').length,
      partnerCompanies: Math.floor(Math.random() * 20) + 5, // Mock partner count
    };
  }
}

export const storage = new MemStorage();
