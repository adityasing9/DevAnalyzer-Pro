from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.github_service import fetch_user_data
from services.scoring_service import calculate_score, infer_domains
import os

# Optional: AI Integration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    github_username: str

@app.post("/api/analyze")
async def analyze_profile(request: AnalyzeRequest):
    try:
        # 1. Fetch Deep Data
        data = await fetch_user_data(request.github_username)
        
        # 2. Calculate Professional Score
        score = calculate_score(data)
        domains = infer_domains(data["languages"])
        
        # 3. Intelligent Analysis (Deterministic Logic for Accuracy)
        # We can add Gemini here for 'interpreting' these results later
        
        # Strength logic
        if data["total_stars"] > 50:
            strength = "High community impact with significant project recognition."
        elif data["recent_activity_count"] > 10:
            strength = "Extremely active contributor with high recent momentum."
        else:
            strength = "Consistent project structure and documentation habits."

        # Weakness logic
        if len(data["languages"]) < 2:
            weakness = "Technological silos; specialized but lacks cross-stack versatility."
        elif data["total_stars"] < 5:
            weakness = "Low discoverability; projects lack public visibility or utility."
        else:
            weakness = "Limited contribution to major open-source ecosystems."

        return {
            "github_username": request.github_username,
            "name": data["name"],
            "total_repos": data["public_repos"],
            "total_stars": data["total_stars"],
            "languages": data["languages"],
            "inferred_domains": domains,
            "score": score,
            "strengths": strength,
            "weaknesses": weakness,
            "suggestions": f"Deepen expertise in {domains[0] if domains else 'emerging tech'} by contributing to high-star repositories."
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
