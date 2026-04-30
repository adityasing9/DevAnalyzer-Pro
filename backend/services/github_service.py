import httpx
from fastapi import HTTPException
import os
from datetime import datetime, timedelta

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", None)

async def fetch_user_data(username: str) -> dict:
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    async with httpx.AsyncClient(timeout=20.0) as client:
        # 1. Fetch user profile
        user_resp = await client.get(f"https://api.github.com/users/{username}", headers=headers)
        if user_resp.status_code == 404:
            raise HTTPException(status_code=404, detail="GitHub user not found")
        user_profile = user_resp.json()
        
        # 2. Fetch repos
        repos_resp = await client.get(f"https://api.github.com/users/{username}/repos?per_page=100&sort=updated", headers=headers)
        repos_data = repos_resp.json() if repos_resp.status_code == 200 else []
        
        # 3. Fetch recent events (to calculate activity)
        events_resp = await client.get(f"https://api.github.com/users/{username}/events/public?per_page=100", headers=headers)
        events_data = events_resp.json() if events_resp.status_code == 200 else []
        
        # 4. Aggregation
        total_stars = sum(r.get("stargazers_count", 0) for r in repos_data)
        total_forks = sum(r.get("forks_count", 0) for r in repos_data)
        
        # Calculate Activity (PushEvents in last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_pushes = 0
        for event in events_data:
            if event["type"] == "PushEvent":
                created_at = datetime.strptime(event["created_at"], "%Y-%m-%dT%H:%M:%SZ")
                if created_at > thirty_days_ago:
                    recent_pushes += 1

        languages = {}
        for repo in repos_data:
            lang = repo.get("language")
            if lang:
                languages[lang] = languages.get(lang, 0) + repo.get("size", 0)

        return {
            "username": username,
            "name": user_profile.get("name") or username,
            "bio": user_profile.get("bio", ""),
            "followers": user_profile.get("followers", 0),
            "following": user_profile.get("following", 0),
            "public_repos": user_profile.get("public_repos", 0),
            "total_stars": total_stars,
            "total_forks": total_forks,
            "recent_activity_count": recent_pushes,
            "languages": languages,
            "repo_details": [{"name": r["name"], "stars": r["stargazers_count"], "lang": r["language"]} for r in repos_data[:5]]
        }
