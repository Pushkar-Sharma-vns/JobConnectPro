from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List
import os
from jose import JWTError, jwt
from passlib.context import CryptContext

from database import get_db, engine
from models import Base, User, Job, Application, AgencyCandidate, Profile
from schemas import (
    UserCreate, UserResponse, UserLogin, Token,
    JobCreate, JobResponse, ApplicationCreate, ApplicationResponse,
    AgencyCandidateCreate, AgencyCandidateResponse,
    ProfileCreate, ProfileResponse, CandidateStatsResponse,
    CompanyStatsResponse, AgencyStatsResponse
)
from auth import get_current_user, create_access_token, verify_password, get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="JobPortal Pro API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

@app.get("/")
async def root():
    return {"message": "JobPortal Pro API"}

# Auth endpoints
@app.post("/api/auth/register", response_model=dict)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists with this email"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        password=hashed_password,
        name=user_data.name,
        role=user_data.role,
        company_name=user_data.company_name,
        agency_name=user_data.agency_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate token
    access_token = create_access_token(data={"userId": db_user.id})
    
    return {
        "user": UserResponse.from_orm(db_user),
        "token": access_token
    }

@app.post("/api/auth/login", response_model=dict)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # Find user
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if not db_user or not verify_password(user_data.password, str(db_user.password)):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Generate token
    access_token = create_access_token(data={"userId": db_user.id})
    
    return {
        "user": UserResponse.from_orm(db_user),
        "token": access_token
    }

@app.get("/api/auth/me", response_model=dict)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {"user": UserResponse.from_orm(current_user)}

# Job endpoints
@app.get("/api/jobs", response_model=List[JobResponse])
async def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).filter(Job.status == "active").order_by(Job.created_at.desc()).all()
    return jobs

@app.get("/api/jobs/{job_id}", response_model=JobResponse)
async def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.post("/api/jobs", response_model=JobResponse)
async def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["company", "agency"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    db_job = Job(
        **job_data.dict(),
        posted_by_id=current_user.id,
        posted_by_type=current_user.role
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@app.get("/api/my-jobs", response_model=List[JobResponse])
async def get_my_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["company", "agency"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    jobs = db.query(Job).filter(Job.posted_by_id == current_user.id).order_by(Job.created_at.desc()).all()
    return jobs

@app.put("/api/jobs/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: int,
    job_updates: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.posted_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own jobs")
    
    for key, value in job_updates.items():
        if hasattr(job, key):
            setattr(job, key, value)
    
    db.commit()
    db.refresh(job)
    return job

# Application endpoints
@app.post("/api/applications", response_model=ApplicationResponse)
async def create_application(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "candidate":
        raise HTTPException(status_code=403, detail="Only candidates can apply")
    
    # Check if already applied
    existing = db.query(Application).filter(
        Application.job_id == application_data.job_id,
        Application.candidate_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied to this job")
    
    db_application = Application(
        **application_data.dict(),
        candidate_id=current_user.id
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@app.get("/api/my-applications", response_model=List[dict])
async def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "candidate":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    applications = db.query(Application).filter(
        Application.candidate_id == current_user.id
    ).order_by(Application.applied_at.desc()).all()
    
    # Enrich with job data
    result = []
    for app in applications:
        job = db.query(Job).filter(Job.id == app.job_id).first()
        result.append({
            **ApplicationResponse.from_orm(app).dict(),
            "job": JobResponse.from_orm(job).dict() if job else None
        })
    
    return result

@app.get("/api/job-applications/{job_id}", response_model=List[dict])
async def get_job_applications(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["company", "agency"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job or job.posted_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only view applications for your own jobs")
    
    applications = db.query(Application).filter(Application.job_id == job_id).all()
    
    # Enrich with candidate data
    result = []
    for app in applications:
        candidate = db.query(User).filter(User.id == app.candidate_id).first()
        result.append({
            **ApplicationResponse.from_orm(app).dict(),
            "candidate": UserResponse.from_orm(candidate).dict() if candidate else None
        })
    
    return result

@app.put("/api/applications/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: int,
    updates: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check if user owns the job
    job = db.query(Job).filter(Job.id == application.job_id).first()
    if not job or job.posted_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update applications for your own jobs")
    
    for key, value in updates.items():
        if hasattr(application, key):
            setattr(application, key, value)
    
    db.commit()
    db.refresh(application)
    return application

# Agency candidate endpoints
@app.get("/api/agency-candidates", response_model=List[dict])
async def get_agency_candidates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "agency":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    candidates = db.query(AgencyCandidate).filter(
        AgencyCandidate.agency_id == current_user.id
    ).order_by(AgencyCandidate.added_at.desc()).all()
    
    # Enrich with user data
    result = []
    for candidate in candidates:
        user = db.query(User).filter(User.id == candidate.candidate_id).first()
        result.append({
            **AgencyCandidateResponse.from_orm(candidate).dict(),
            "candidate": UserResponse.from_orm(user).dict() if user else None
        })
    
    return result

@app.post("/api/agency-candidates", response_model=AgencyCandidateResponse)
async def create_agency_candidate(
    candidate_data: AgencyCandidateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "agency":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    db_candidate = AgencyCandidate(
        **candidate_data.dict(),
        agency_id=current_user.id
    )
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

# Stats endpoints
@app.get("/api/stats/candidate", response_model=CandidateStatsResponse)
async def get_candidate_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "candidate":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    applications = db.query(Application).filter(Application.candidate_id == current_user.id).all()
    
    return CandidateStatsResponse(
        applications=len(applications),
        interviews=len([app for app in applications if app.status == "interview"]),
        pending=len([app for app in applications if app.status in ["pending", "reviewed"]]),
        views=len([app for app in applications]) * 3  # Calculate views based on applications
    )

@app.get("/api/stats/company", response_model=CompanyStatsResponse)
async def get_company_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "company":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    jobs = db.query(Job).filter(Job.posted_by_id == current_user.id).all()
    job_ids = [job.id for job in jobs]
    applications = db.query(Application).filter(Application.job_id.in_(job_ids)).all()
    
    return CompanyStatsResponse(
        active_jobs=len([job for job in jobs if job.status == "active"]),
        total_applications=len(applications),
        pending_reviews=len([app for app in applications if app.status == "pending"]),
        interviews=len([app for app in applications if app.status == "interview"])
    )

@app.get("/api/stats/agency", response_model=AgencyStatsResponse)
async def get_agency_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "agency":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    candidates = db.query(AgencyCandidate).filter(AgencyCandidate.agency_id == current_user.id).all()
    jobs = db.query(Job).filter(Job.posted_by_id == current_user.id).all()
    
    return AgencyStatsResponse(
        candidate_pool=len(candidates),
        active_placements=len([c for c in candidates if c.status == "interviewing"]),
        successful_placements=len([c for c in candidates if c.status == "placed"]),
        partner_companies=len(set([job.posted_by_id for job in jobs])) if jobs else 0
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)