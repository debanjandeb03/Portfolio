import os
from fastapi import FastAPI,Header, HTTPException
from dotenv import load_dotenv
from supabase import create_client, Client
from schemas.question import QuestionCreate,QuestionAnswer
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

#Load Environment Variables
load_dotenv()
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SECRET_KEY")

#Create Supabase Client
supabase: Client = create_client(supabase_url, supabase_key)


#FastAPI Application
app = FastAPI(
    title="Debanjan Portfolio API",
    description="Backend API for the portfolio Q&A system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message":"Debanjan Portfolio API is running"}

@app.get("/health")
def health():
    return {"status":"healthy"}

@app.get("/supabase_test")
def supabase_test():

    response = (
        supabase
        .table("questions")
        .select("id")
        .limit(1)
        .execute()
    )

    return {"message":"Supabase connection successful", "data": response.data}

@app.post("/api/questions")
def create_question(question_data: QuestionCreate):
    response = (
        supabase
        .table("questions")
        .insert({
            "question": question_data.question,
            "email": question_data.email
        })
        .execute()
    )
    return {"message": "Question submitted successfully", "data": response.data}

@app.get("/api/admin/questions")
def get_questions(
    x_admin_password: str | None = Header(default=None)
):

    admin_password = os.getenv("ADMIN_PASSWORD")

    if x_admin_password != admin_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin password"
        )

    response = (
        supabase
        .table("questions")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )

    return {
        "data": response.data
    }

    return {"message": "Question submitted successfully", "data": response.data}

@app.patch("/api/admin/questions/{question_id}")
def answer_question(
    question_id: int,
    answer_data: QuestionAnswer,
    x_admin_password: str | None = Header(default=None)
):

    admin_password = os.getenv("ADMIN_PASSWORD")

    if x_admin_password != admin_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin password"
        )


    response = (
        supabase
        .table("questions")
        .update({
            "answer": answer_data.answer,
            "status": "answered",
            "answered_at": datetime.now(timezone.utc).isoformat()
        })
        .eq("id", question_id)
        .execute()
    )


    return {
        "message": "Question answered successfully",
        "data": response.data
    }

@app.get("/api/questions/answered")
def get_answered_questions():
    response = (
        supabase
        .table("questions")
        .select("id, question, answer, created_at")
        .eq("status", "answered")
        .order("created_at", desc=True)
        .execute()
    )

    return {"data": response.data}