import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
from app.core.logger import logger

class ResumeVectorStore:
    def __init__(self):
        logger.info("Initializing VectorStore and SentenceTransformer model...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2') 
        self.dimension = self.model.get_sentence_embedding_dimension()
        self.index = faiss.IndexFlatL2(self.dimension)
        self.registry: Dict[int, Any] = {}
        self._current_id = 0

    def clear(self):
        self.index.reset()
        self.registry.clear()
        self._current_id = 0

    def load_user(self, profile: Any):
        """Creates semantic embeddings for User's experiences and projects."""
        self.clear()
        for exp in profile.experience:
            text = f"Experience: {exp.title} at {exp.company}. " + " ".join(exp.description)
            embed = self.model.encode([text])[0]
            self.index.add(np.array([embed]).astype('float32'))
            self.registry[self._current_id] = {"type": "experience", "data": exp.model_dump()}
            self._current_id += 1

        for proj in profile.projects:
            text = f"Project: {proj.name}. Tech: {', '.join(proj.technologies)}. " + " ".join(proj.description)
            embed = self.model.encode([text])[0]
            self.index.add(np.array([embed]).astype('float32'))
            self.registry[self._current_id] = {"type": "projects", "data": proj.model_dump()}
            self._current_id += 1
            
        logger.info(f"Loaded {self._current_id} vectors for user {profile.id}.")

    def search(self, query: str, top_k: int = 5) -> Dict[str, List[Any]]:
        if self._current_id == 0:
            return {"experience": [], "projects": []}
            
        real_k = min(top_k, self._current_id)
        query_emb = self.model.encode([query])
        D, I = self.index.search(np.array(query_emb).astype('float32'), real_k)
        
        results = {"experience": [], "projects": []}
        for raw_idx in I[0]:
            idx = int(raw_idx)  # numpy int64 → Python int for reliable dict lookup
            if idx == -1 or idx not in self.registry:
                continue
            item = self.registry[idx]
            item_type = item["type"]
            if item_type in results:
                results[item_type].append(item["data"])
            else:
                plural = item_type + "s" if not item_type.endswith("s") else item_type
                if plural in results:
                    results[plural].append(item["data"])

        return results

vector_store = ResumeVectorStore()
