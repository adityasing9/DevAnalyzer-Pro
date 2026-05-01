import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { github_username } = await req.json();
    console.log(`[LOG] Analyzing user: ${github_username}`);
    if (!github_username) throw new Error("Missing github_username");

    const fetchWithToken = async (url) => {
        try {
            const headers = { "Accept": "application/vnd.github.v3+json" };
            if (GITHUB_TOKEN) headers["Authorization"] = `token ${GITHUB_TOKEN}`;
            
            const resp = await fetch(url, { headers });
            if (!resp.ok) {
                console.warn(`[WARN] GitHub API issue for ${url}: ${resp.status}`);
                return null;
            }
            return resp.json();
        } catch (err) {
            console.error(`[ERROR] Fetch failed for ${url}: ${err.message}`);
            return null;
        }
    };

    // Parallel fetch with individual error handling
    console.log(`[LOG] Fetching data for ${github_username}...`);
    const [user, repos, events] = await Promise.all([
        fetchWithToken(`https://api.github.com/users/${github_username}`),
        fetchWithToken(`https://api.github.com/users/${github_username}/repos?per_page=100&sort=updated`),
        fetchWithToken(`https://api.github.com/users/${github_username}/events/public?per_page=100`)
    ]);

    if (!user) throw new Error("Could not retrieve GitHub user profile.");

    // Data Processing
    const safeRepos = repos || [];
    const safeEvents = events || [];

    const totalStars = safeRepos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
    const totalForks = safeRepos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPushes = safeEvents.filter(e => e.type === 'PushEvent' && new Date(e.created_at) > thirtyDaysAgo).length;

    const languages = {};
    safeRepos.forEach(r => {
      if (r.language) languages[r.language] = (languages[r.language] || 0) + (r.size || 0);
    });

    const rawScore = (user.public_repos * 2) + (user.followers * 5) + (totalStars * 10) + (totalForks * 15) + (recentPushes * 20) + (Object.keys(languages).length * 25);
    const score = Math.min(Math.floor(200 * Math.log10(rawScore + 1)), 1000);

    const sortedLangs = Object.entries(languages).sort((a, b) => b[1] - a[1]);
    const topLangs = sortedLangs.slice(0, 3).map(l => l[0]);
    
    const domainMap = {
        "Frontend": ["JavaScript", "TypeScript", "HTML", "CSS", "Vue", "React", "Svelte"],
        "Backend": ["Python", "Java", "Go", "C#", "Ruby", "PHP", "Rust", "Node.js"],
        "Data & ML": ["Python", "Jupyter Notebook", "R", "Scala", "Julia"],
        "Systems": ["C", "C++", "Rust", "Assembly"],
        "Mobile": ["Swift", "Kotlin", "Dart"]
    };
    
    const domains = Array.from(new Set(topLangs.flatMap(l => Object.entries(domainMap).filter(([d, langs]) => langs.includes(l)).map(([d]) => d))));

    const topRepos = safeRepos
        .sort((a, b) => (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count))
        .slice(0, 5)
        .map(r => ({ 
            name: r.name, 
            score: Math.floor((r.stargazers_count * 10) + (r.forks_count * 5) + (r.watchers_count * 2)), 
            description: r.description, 
            language: r.language || "Unknown"
        }));

    return new Response(JSON.stringify({
      github_username,
      name: user.name || github_username,
      avatar_url: user.avatar_url,
      bio: user.bio,
      total_repos: user.public_repos,
      total_stars: totalStars,
      score,
      readiness_score: Math.floor((score / 1000) * 100),
      primary_domain: domains[0] || "Generalist",
      inferred_domains: domains,
      languages,
      strengths: totalStars > 50 ? "High community impact" : "Consistent active contributions",
      weaknesses: Object.keys(languages).length < 3 ? "Specialized silo" : "Broad but potentially surface-level stack",
      top_repos: topRepos,
      roadmap: [
        `Master advanced ${domains[0] || 'Modern'} architectural patterns.`,
        `Contribute to 3 major open-source projects in your stack.`,
        `Publish a technical whitepaper or deep-dive blog series.`
      ],
      history: [{ date: 'Initial', iq: Math.floor(score * 0.8) }, { date: 'Current', iq: score }]
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error(`[FATAL ERROR] ${error.message}`);
    return new Response(JSON.stringify({ 
        detail: error.message,
        top_repos: [],
        history: [],
        languages: {},
        specializations: [],
        insights: [],
        roadmap: []
    }), {
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
