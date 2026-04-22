import os
import re
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
from app.models.resume import ResumeData
from app.core.logger import logger

TEMPLATE_DIR = Path("data/templates")
TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)

def escape_latex(s: str) -> str:
    """Escapes strings for TeX/LaTeX compatibility."""
    if not s:
        return ""
    
    escape_map = {
        '\\': r'\textbackslash{}',
        '{': r'\{',
        '}': r'\}',
        '_': r'\_',
        '%': r'\%',
        '$': r'\$',
        '&': r'\&',
        '#': r'\#',
        '^': r'\textasciicircum{}',
        '~': r'\textasciitilde{}',
    }
    
    rx = re.compile('|'.join(map(re.escape, escape_map)))
    return rx.sub(lambda match: escape_map[match.group(0)], str(s))

class LatexBuilder:
    def __init__(self):
        self.env = Environment(
            loader=FileSystemLoader(TEMPLATE_DIR),
            block_start_string='<BLOCK>',
            block_end_string='</BLOCK>',
            variable_start_string='<<',
            variable_end_string='>>',
            comment_start_string='<#',
            comment_end_string='#>',
            trim_blocks=True,
            autoescape=False 
        )
        self.env.filters['escape_tex'] = escape_latex

    def build_resume(self, resume_data: ResumeData) -> str:
        try:
            template = self.env.get_template("modern_resume.tex")
            logger.info("Rendering LaTeX with Jinja")
            data_dict = resume_data.dict()
            output = template.render(**data_dict)
            return output
        except Exception as e:
            logger.exception("Failed to build LaTeX resume")
            raise

latex_builder = LatexBuilder()
