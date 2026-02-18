import numpy as np
import pandas as pd
import joblib
import xgboost as xgb

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

class SalaryPredictionRequest(BaseModel):
    experience: float
    qualification: str
    work_type: str
    job_title: str
    role: str
    job_description: str
    skills: str
    responsibilities: str
@app.get("/")
async def root():
    return {"message": "Salary Prediction API Running 🚀"}
@app.post("/predictsalary")
async def predictsalary(data: SalaryPredictionRequest):
    df_new = pd.DataFrame([data.dict()])
    X_num = csr_matrix(df_new[["experience"]].values)
    X_cat = ohe.transform(df_new[categorical_cols])
    text_combined = (
        df_new["job_description"] + " " +
        df_new["skills"] + " " +
        df_new["responsibilities"]
    )
    X_text = tfidf.transform(text_combined)
    X_final = hstack([X_num, X_cat, X_text])
    dnew = xgb.DMatrix(X_final)
    pred_log = bst.predict(dnew)
    pred_salary = np.expm1(pred_log)
    return {
        "predicted_salary": float(round(pred_salary[0], 2))
    }
