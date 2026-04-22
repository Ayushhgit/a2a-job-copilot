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
            "You have the JD skills. First, use `VectorSearchTool` passing the top job skills into the query. Calculate an ATS `match_score` (e.g. 85) and list `missing_skills`. Route a payload to ResumeGenerator containing: { 'jd_analysis': ..., 'matched_items': ..., 'match_score': ..., 'missing_skills': ... }"
        )

class ResumeGeneratorAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            "ResumeGenerator",
            "You receive matched user items and JD requirements. Construct a strictly typed JSON conforming to the structural Resume schema (name, email, skills array, experience array, projects array, education array). Route this final JSON payload to the Optimizer agent."
        )

class OptimizerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            "Optimizer",
            "You receive a drafted compile-ready JSON payload. Enhance the bullet points using ATS action verbs. Use the `CompileLatexTool` passing the enhanced JSON to get the raw '.tex' string. Return the LaTeX output string and Match Score as a system 'result' message."
        )

jd_analyzer = JDAnalyzerAgent()
matcher = MatcherAgent()
resume_generator = ResumeGeneratorAgent()
optimizer = OptimizerAgent()
