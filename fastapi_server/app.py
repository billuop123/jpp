import numpy as np
import pandas as pd
import joblib
import xgboost as xgb

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from scipy.sparse import csr_matrix, hstack
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

ohe = joblib.load(os.path.join(BASE_DIR, "ohe.pkl"))
tfidf = joblib.load(os.path.join(BASE_DIR, "tfidf.pkl"))
categorical_cols = joblib.load(os.path.join(BASE_DIR, "categorical_cols.pkl"))

bst = xgb.Booster()
bst.load_model(os.path.join(BASE_DIR, "xgb_salary_model.json"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_JOB_TITLES = [
    "Data Analyst", "Data Engineer", "Web Designer", "UX/UI Designer", "UX Researcher",
    "UI Developer", "Systems Engineer", "Systems Analyst", "Systems Administrator",
    "Software Tester", "Software Engineer", "Software Developer", "Software Architect",
    "QA Analyst", "Network Technician", "Network Security Specialist", "Network Engineer",
    "Java Developer", "IT Support Specialist", "IT Manager", "Front-End Engineer",
    "Front-End Developer", "Database Developer", "Database Administrator", "Data Scientist",
    "Web Developer", "Network Analyst", "IT Administrator", "QA Engineer"
]

class SalaryPredictionRequest(BaseModel):
    experience: float
    qualification: str
    work_type: str
    job_title: str
    role: str
    
    @field_validator('job_title')
    @classmethod
    def validate_job_title(cls, v):
        if v not in VALID_JOB_TITLES:
            raise ValueError(f'job_title must be one of: {", ".join(VALID_JOB_TITLES)}')
        return v
@app.get("/")
async def root():
    return {"message": "Salary Prediction API Running 🚀"}

@app.get("/job-titles")
async def get_job_titles():
    return {"job_titles": VALID_JOB_TITLES}

@app.post("/predictsalary")
async def predictsalary(data: SalaryPredictionRequest):
    # Map grouped qualifications to original values
    qualification_map = {
        "BCA/CSIT/BIT": "BCA",
        "B.Tech/BE": "B.Tech",
        "BBA/BBS": "BBA",
        "MCA/MIT": "MCA",
        "M.Tech/ME": "M.Tech"
    }
    
    mapped_qualification = qualification_map.get(data.qualification, data.qualification)
    
    df_new = pd.DataFrame([{
        "experience": data.experience,
        "qualification": mapped_qualification,
        "work_type": data.work_type,
        "job_title": data.job_title,
        "role": data.role
    }])
    
    X_num = csr_matrix(df_new[["experience"]].values)
    X_cat = ohe.transform(df_new[categorical_cols])
    X_final = hstack([X_num, X_cat])
    dnew = xgb.DMatrix(X_final)
    pred_log = bst.predict(dnew)
    pred_salary = np.expm1(pred_log)
    
    # Experience-based adjustment
    if data.experience < 1:
        experience_factor = 0.4
    elif data.experience < 3:
        experience_factor = 0.65
    elif data.experience < 5:
        experience_factor = 0.85
    elif data.experience < 8:
        experience_factor = 1.0
    else:
        experience_factor = 1.15
    
    # Work type multiplier
    work_type_multiplier = {
        "Full-Time": 1.0,
        "Part-Time": 0.55,
        "Contract": 0.8,
        "Temporary": 0.45,
        "Intern": 0.25
    }.get(data.work_type, 1.0)
    
    # Job title multiplier
    job_title_lower = data.job_title.lower()
    if "manager" in job_title_lower or "director" in job_title_lower:
        job_multiplier = 1.4
    elif "architect" in job_title_lower:
        job_multiplier = 1.25
    elif "engineer" in job_title_lower:
        job_multiplier = 1.1
    elif "developer" in job_title_lower:
        job_multiplier = 1.05
    elif "scientist" in job_title_lower:
        job_multiplier = 1.15
    elif "analyst" in job_title_lower:
        job_multiplier = 0.9
    elif "designer" in job_title_lower:
        job_multiplier = 0.85
    elif "tester" in job_title_lower or "qa" in job_title_lower:
        job_multiplier = 0.8
    elif "support" in job_title_lower or "technician" in job_title_lower:
        job_multiplier = 0.7
    else:
        job_multiplier = 1.0
    
    adjusted_salary = pred_salary[0] * experience_factor * work_type_multiplier * job_multiplier
    avg_salary = float(round(adjusted_salary, 2))
    
    return {
        "predicted_salary": avg_salary,
        "lower_range": float(round(avg_salary * 0.85, 2)),
        "upper_range": float(round(avg_salary * 1.15, 2))
    }
