from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # candidate, company, agency
    company_name = Column(String, nullable=True)
    agency_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    department = Column(String, nullable=True)
    employment_type = Column(String, nullable=False)
    experience_level = Column(String, nullable=False)
    location = Column(String, nullable=True)
    remote_work = Column(String, nullable=False)
    skills = Column(Text, nullable=True)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    deadline = Column(DateTime, nullable=True)
    status = Column(String, default="active", nullable=False)
    posted_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    posted_by_type = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending", nullable=False)
    applied_at = Column(DateTime, default=datetime.utcnow)
    interview_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

class AgencyCandidate(Base):
    __tablename__ = "agency_candidates"
    
    id = Column(Integer, primary_key=True, index=True)
    agency_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    specialization = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    rating = Column(Integer, default=0)
    status = Column(String, default="available", nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)

class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bio = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)
    experience = Column(Text, nullable=True)
    education = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)