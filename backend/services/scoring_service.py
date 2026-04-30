import math

def calculate_score(data: dict) -> int:
    """
    Weighted Multi-dimensional Scoring System
    """
    # 1. Volume Score (Repos & Followers)
    volume = (data["public_repos"] * 2) + (data["followers"] * 5)
    
    # 2. Quality Score (Stars & Forks)
    quality = (data["total_stars"] * 10) + (data["total_forks"] * 15)
    
    # 3. Activity Score (Recent Pushes)
    activity = data["recent_activity_count"] * 20
    
    # 4. Diversity Bonus (Languages)
    diversity = len(data["languages"]) * 25
    
    # Final Weighted Aggregate
    raw_score = volume + quality + activity + diversity
    
    # Logarithmic Normalization (to keep it in a 0-1000 range visually)
    if raw_score <= 0: return 0
    normalized = int(200 * math.log10(raw_score + 1))
    
    return min(normalized, 1000)

def infer_domains(languages: dict) -> list:
    domain_map = {
        "Frontend": ["JavaScript", "TypeScript", "HTML", "CSS", "Vue", "React", "Svelte"],
        "Backend": ["Python", "Java", "Go", "C#", "Ruby", "PHP", "Rust", "Node.js"],
        "Data & ML": ["Python", "Jupyter Notebook", "R", "Scala", "Julia"],
        "Systems": ["C", "C++", "Rust", "Assembly"],
        "Mobile": ["Swift", "Kotlin", "Dart"]
    }
    
    sorted_langs = sorted(languages.items(), key=lambda x: x[1], reverse=True)
    top_langs = [l[0] for l in sorted_langs[:3]]
    
    inferred = set()
    for lang in top_langs:
        for domain, lang_list in domain_map.items():
            if lang in lang_list:
                inferred.add(domain)
                
    return list(inferred)
