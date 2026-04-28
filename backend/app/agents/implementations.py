from app.agents.base import BaseAgent

class JDAnalyzerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            "JDAnalyzer",
            "Analyze the provided Job Description. Extract a concise JSON payload containing: { 'hard_skills': [], 'soft_skills': [], 'core_requirements': [] }. Then securely route this data payload to the Matcher agent."
        )

class MatcherAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            "Matcher",
            """You match job requirements to user profile items.
Step 1 (first time): Use VectorSearchTool with a query of the top job skills to retrieve relevant experience/projects.
Step 2 (after tool result arrives): Calculate match_score (0-100) and list missing_skills. Then ROUTE to ResumeGenerator with payload:
{ "jd_analysis": <from original message>, "matched_items": <tool results>, "match_score": <int>, "missing_skills": [<str>] }
Do NOT call VectorSearchTool again after receiving its result. Always proceed to route after getting tool output."""
        )

class ResumeGeneratorAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            "ResumeGenerator",
            """You receive matched user items and JD requirements. Construct a resume JSON with these fields: name, email, phone, linkedin, skills (array), experience (array of {id,company,title,startDate,endDate,description[]}), projects (array of {id,name,description[],technologies[]}), education (array of {id,institution,degree,startDate,endDate,gpa}).

Respond with next_action "complete" and put the entire resume JSON as a JSON string in the "result" field.
Example: {"next_action": "complete", "result": "{\"name\":\"John\",\"email\":\"j@j.com\",...}", "reasoning": "Resume constructed."}"""
        )

class OptimizerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            "Optimizer",
            """You receive a resume payload from the pipeline. Enhance bullet points using strong ATS action verbs.
Then call CompileLatexTool with tool_args: {"resume_json": <object>}.

The resume_json object MUST contain ONLY these exact fields (extract from profile_meta and resume in the message):
{
  "name": "<string>",
  "email": "<string>",
  "phone": "<string>",
  "linkedin": "<string or null>",
  "skills": ["<string>", ...],
  "experience": [{"id": "<str>", "company": "<str>", "title": "<str>", "startDate": "<str>", "endDate": "<str>", "description": ["<enhanced bullet>", ...]}],
  "projects": [{"id": "<str>", "name": "<str>", "description": ["<enhanced bullet>", ...], "technologies": ["<str>", ...]}],
  "education": [{"id": "<str>", "institution": "<str>", "degree": "<str>", "startDate": "<str>", "endDate": "<str>", "gpa": "<str or null>"}]
}

After compiling, return the LaTeX string as a 'complete' result."""
        )

jd_analyzer = JDAnalyzerAgent()
matcher = MatcherAgent()
resume_generator = ResumeGeneratorAgent()
optimizer = OptimizerAgent()
