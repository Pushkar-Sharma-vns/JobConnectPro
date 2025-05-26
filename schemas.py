from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRoleEnum(str, Enum):
    candidate = "candidate"
    company = "company"
    agency = "agency"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRoleEnum
    company_name: Optional[str] = None
    agency_name: Optional[str] = None

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    company_name: Optional[str] = None
    agency_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class JobCreate(BaseModel):
    title: str
    description: str
    department: Optional[str] = None
    employment_type: str
    experience_level: str
    location: Optional[str] = None
    remote_work: str
    skills: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    deadline: Optional[datetime] = None

class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    department: Optional[str] = None
    employment_type: str
    experience_level: str
    location: Optional[str] = None
    remote_work: str
    skills: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    deadline: Optional[datetime] = None
    status: str
    posted_by_id: int
    posted_by_type: str
    created_at: datetime

    class Config:
        from_attributes = True

class ApplicationCreate(BaseModel):
    job_id: int
    status: Optional[str] = "pending"
    interview_date: Optional[datetime] = None
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    status: str
    applied_at: datetime
    interview_date: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class AgencyCandidateCreate(BaseModel):
    candidate_id: int
    specialization: Optional[str] = None
    experience: Optional[str] = None
    rating: Optional[int] = 0
    status: Optional[str] = "available"

class AgencyCandidateResponse(BaseModel):
    id: int
    agency_id: int
    candidate_id: int
    specialization: Optional[str] = None
    experience: Optional[str] = None
    rating: Optional[int] = 0
    status: str
    added_at: datetime

    class Config:
        from_attributes = True

class ProfileCreate(BaseModel):
    bio: Optional[str] = None
    skills: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    location: Optional[str] = None
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    bio: Optional[str] = None
    skills: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    location: Optional[str] = None
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class CandidateStatsResponse(BaseModel):
    applications: int
    interviews: int
    pending: int
    views: int

class CompanyStatsResponse(BaseModel):
    active_jobs: int
    total_applications: int
    pending_reviews: int
    interviews: int

class AgencyStatsResponse(BaseModel):
    candidate_pool: int
    active_placements: int
    successful_placements: int
    partner_companies: int