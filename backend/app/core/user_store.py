import json
from pathlib import Path
from app.models.resume import UserProfile
from app.core.logger import logger

DATA_DIR = Path("data/users")
DATA_DIR.mkdir(parents=True, exist_ok=True)

class UserStore:
    def __init__(self):
        self.users = {}

    def get_user(self, user_id: str) -> UserProfile:
        filepath = DATA_DIR / f"{user_id}.json"
        if not filepath.exists():
            return None
        with open(filepath, "r") as f:
            data = json.load(f)
            return UserProfile(**data)

    def save_user(self, profile: UserProfile):
        filepath = DATA_DIR / f"{profile.id}.json"
        with open(filepath, "w") as f:
            json.dump(profile.dict(), f, indent=4)
        logger.info(f"Saved user profile {profile.id}")

user_store = UserStore()
