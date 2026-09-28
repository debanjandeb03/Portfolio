from pydantic import BaseModel,EmailStr, Field

class QuestionCreate(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)
    email: EmailStr = Field(..., description="Email address of the user submitting the question")

class QuestionAnswer(BaseModel):
    answer: str = Field(
        ...,
        min_length=1,
        max_length=2000
    )