from pydantic import BaseModel, Field
from typing import List, Optional

class Experience(BaseModel):
    id: str
    company: str
    title: str
    startDate: str
    endDate: str
    description: List[str]

class Project(BaseModel):
    id: str
    name: str
    description: List[str]
    technologies: List[str]

class Education(BaseModel):
    id: str
    institution: str
    degree: str
    startDate: str
    endDate: str
    gpa: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    linkedin: Optional[str] = None
    skills: List[str]
    experience: List[Experience]
    projects: List[Project]
    education: List[Education]

class ResumeData(BaseModel):
    """The structured JSON passed to the LaTeX Builder."""
    name: str
    email: str
    phone: str
    linkedin: Optional[str] = None
    skills: List[str]
    experience: List[Experience]
    projects: List[Project]
    education: List[Education]
