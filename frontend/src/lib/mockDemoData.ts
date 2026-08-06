import type {
  Repo,
  HealthSnapshot,
  GraphResponse,
  BusFactorWrapper,
  HotspotResponse,
  LLMUsage,
  CommitDetailResponse,
  NarrativeStreamChunk
} from '../types'

export const mockRepo: Repo = {
  id: 999999, // Special ID for demo
  url: "https://github.com/facebook/react",
  name: "facebook/react",
  owner: "facebook",
  repo_slug: "facebook-react",
  default_branch: "main",
  ingested_at: new Date().toISOString(),
  last_updated_at: new Date().toISOString(),
  total_commits: 100,
  analyzed_commits: 40,
  status: "ready",
  error_message: null,
  max_commits_setting: 100,
  github_stars: 221500,
  github_language: "JavaScript",
  github_description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
}

// Generate 40 snapshots for the timeline
export const mockTimeline: HealthSnapshot[] = Array.from({ length: 40 }).map((_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (40 - i) * 1.5)
  const sha_hex = `d1d0f8${i.toString(16).padStart(2, '0')}00000000000000000000000000`
  
  let health_score = 80.0
  if (i < 10) health_score = 80.0 + (i * 0.5)
  else if (i < 25) health_score = 85.0 - ((i - 10) * 1.2)
  else health_score = 67.0 + ((i - 25) * 1.5)

  const avg_complexity = i < 20 ? (3.5 + (i * 0.05)) : (4.5 - ((i - 20) * 0.03))
  const max_complexity = 12.0 + (i % 5)
  const total_loc = 45000 + (i * 150)
  const churn_rate = 0.05 + (i % 3) * 0.1
  const num_files_changed = 1 + (i % 4)
  const bus_factor_min = i >= 12 && i <= 24 ? 1 : 2

  return {
    id: i + 1,
    repo_id: mockRepo.id,
    commit_id: i + 1,
    sha: sha_hex.slice(0, 12),
    full_sha: sha_hex,
    message: `chore: update packages and optimize concurrent loop part ${i}`,
    author: "Dan Abramov",
    author_email: "dan@fb.com",
    committed_at: date.toISOString(),
    health_score,
    avg_complexity,
    max_complexity,
    total_loc,
    churn_rate,
    num_files_changed,
    bus_factor_min,
    health_delta: i > 0 ? 1.2 : null,
    cc_score: health_score + 2.0,
    churn_score: 100.0 - (churn_rate * 100),
    bus_score: bus_factor_min * 30.0,
    loc_score: 85.0,
    subscores: {
      complexity_drift: 80.0,
      churn_risk: 75.0,
      bus_factor_risk: bus_factor_min * 40.0,
      dependency_health: 90.0,
      semantic_drift: 85.0
    },
    dependency_density: 0.15,
    has_cycles: (i % 8 === 0),
    hotspot_count: i > 15 ? 2 : 1,
    avg_semantic_drift: 0.08 + (i % 5) * 0.02,
    semantic_health_score: 85.0 + (i % 3) * 3,
    high_drift_files: i % 10 === 0 ? 1 : 0,
    semantic_drift_method: "fallback_levenshtein",
    risk_reasons: bus_factor_min === 1 ? [
      {
        code: "single_owner",
        severity: "high",
        label: "Single-point-of-failure risk",
        detail: "Critical component ReactFiber.js relies entirely on a single contributor.",
        impact: 20.0
      }
    ] : [],
    hotspot_persistence_score: 45.0,
    persistent_hotspots: [
      { path: "packages/react-reconciler/src/ReactFiber.js", recent_commit_count: 8, complexity: 18.5, loc: 1200 }
    ],
    top_files: [
      { path: "packages/react-reconciler/src/ReactFiber.js", complexity: 18.5, loc: 1200 },
      { path: "packages/react/src/ReactHooks.js", complexity: 12.0, loc: 450 }
    ],
    computed_at: date.toISOString(),
  }
})

export const mockGraph: GraphResponse = {
  repo_id: mockRepo.id,
  commit_sha: "latest",
  nodes: [
    { id: "packages/react/src/React.js", file: "packages/react/src/React.js", module: "react", health: 90, health_color: "green", loc: 180, is_entry_point: true },
    { id: "packages/react/src/ReactBaseClasses.js", file: "packages/react/src/ReactBaseClasses.js", module: "react", health: 85, health_color: "green", loc: 220, is_entry_point: false },
    { id: "packages/react/src/ReactHooks.js", file: "packages/react/src/ReactHooks.js", module: "react", health: 50, health_color: "yellow", loc: 450, is_entry_point: false },
    { id: "packages/react-reconciler/src/ReactFiber.js", file: "packages/react-reconciler/src/ReactFiber.js", module: "react-reconciler", health: 20, health_color: "red", loc: 1200, is_entry_point: false },
    { id: "packages/react-reconciler/src/ReactFiberBeginWork.js", file: "packages/react-reconciler/src/ReactFiberBeginWork.js", module: "react-reconciler", health: 35, health_color: "orange", loc: 950, is_entry_point: false },
    { id: "packages/react-reconciler/src/ReactFiberCommitWork.js", file: "packages/react-reconciler/src/ReactFiberCommitWork.js", module: "react-reconciler", health: 60, health_color: "yellow", loc: 750, is_entry_point: false },
    { id: "packages/react-dom/src/client/ReactDOM.js", file: "packages/react-dom/src/client/ReactDOM.js", module: "react-dom", health: 92, health_color: "green", loc: 320, is_entry_point: true },
    { id: "packages/shared/ReactSharedInternals.js", file: "packages/shared/ReactSharedInternals.js", module: "shared", health: 95, health_color: "green", loc: 80, is_entry_point: false },
  ],
  edges: [
    { source: "packages/react/src/React.js", target: "packages/react/src/ReactBaseClasses.js", type: "import", weight: 1 },
    { source: "packages/react/src/React.js", target: "packages/react/src/ReactHooks.js", type: "import", weight: 1 },
    { source: "packages/react-reconciler/src/ReactFiber.js", target: "packages/react-reconciler/src/ReactFiberBeginWork.js", type: "import", weight: 1 },
    { source: "packages/react-reconciler/src/ReactFiber.js", target: "packages/react-reconciler/src/ReactFiberCommitWork.js", type: "import", weight: 1 },
    { source: "packages/react-dom/src/client/ReactDOM.js", target: "packages/react/src/React.js", type: "import", weight: 1 },
    { source: "packages/react-reconciler/src/ReactFiber.js", target: "packages/shared/ReactSharedInternals.js", type: "import", weight: 1 },
    { source: "packages/react/src/ReactHooks.js", target: "packages/shared/ReactSharedInternals.js", type: "import", weight: 1 },
    { source: "packages/react-reconciler/src/ReactFiber.js", target: "packages/react-reconciler/src/ReactFiberBeginWork.js", type: "co_change", weight: 5 },
    { source: "packages/react/src/React.js", target: "packages/react/src/ReactHooks.js", type: "co_change", weight: 3 },
  ]
}

export const mockBusFactor: BusFactorWrapper = {
  repo_id: mockRepo.id,
  modules: [
    { module_path: "packages/react", contributor_count: 12, top_contributor: "Dan Abramov", top_contributor_email: "dan@fb.com", top_contributor_pct: 0.45, total_commits_to_module: 150, risk_level: "low", last_commit_sha: "latest" },
    { module_path: "packages/react-reconciler", contributor_count: 1, top_contributor: "Sebastian Markbåge", top_contributor_email: "seb@fb.com", top_contributor_pct: 0.95, total_commits_to_module: 300, risk_level: "high", last_commit_sha: "latest" },
    { module_path: "packages/react-dom", contributor_count: 5, top_contributor: "Andrew Clark", top_contributor_email: "andrew@fb.com", top_contributor_pct: 0.60, total_commits_to_module: 200, risk_level: "medium", last_commit_sha: "latest" },
    { module_path: "packages/shared", contributor_count: 8, top_contributor: "Sophie Alpert", top_contributor_email: "sophie@fb.com", top_contributor_pct: 0.50, total_commits_to_module: 80, risk_level: "low", last_commit_sha: "latest" },
  ]
}

export const mockHotspots: HotspotResponse = {
  repo_id: mockRepo.id,
  commit_sha: "latest",
  hotspots: [
    { file: "packages/react-reconciler/src/ReactFiber.js", loc: 1200, complexity: 18.5, churn_count: 8, risk_score: 92 },
    { file: "packages/react-reconciler/src/ReactFiberBeginWork.js", loc: 950, complexity: 14.2, churn_count: 5, risk_score: 75 },
    { file: "packages/react/src/ReactHooks.js", loc: 450, complexity: 12.0, churn_count: 3, risk_score: 55 },
  ]
}

export const mockLLMUsage: LLMUsage = {
  repo_id: mockRepo.id,
  total_calls: 5,
  cache_hits: 2,
  anthropic_calls: 3,
  gemini_calls: 0,
  total_tokens: 15700,
  total_cost_usd: 0.00,
  cache_savings_usd: 0.00,
  budget_remaining: 0.50,
  max_calls: 25,
}

export const getMockCommitDetail = (sha: string): CommitDetailResponse => {
  const index = mockTimeline.findIndex(c => c.full_sha.startsWith(sha) || c.full_sha === sha)
  const snapshot = mockTimeline[index >= 0 ? index : 39]
  
  return {
    repo: mockRepo,
    commit: {
      id: snapshot.commit_id || 999,
      repo_id: mockRepo.id,
      sha: sha.slice(0, 12),
      full_sha: snapshot.full_sha,
      message: "perf: optimize render pathway in concurrent mode scheduling loop",
      author_name: "Dan Abramov",
      author_email: "dan@gaearon.mobi",
      committed_at: snapshot.committed_at || new Date().toISOString(),
      insertions: 125,
      deletions: 42,
      files_changed: 2,
      parent_sha: "parent_sha_123",
    },
    snapshot,
    graph: mockGraph,
    bus_factor: mockBusFactor,
    has_narrative: true,
    narrative: {
      repo_id: mockRepo.id,
      commit_sha: sha,
      prompt_type: "explain_drop",
      explanation: "Mock explanation narrative text",
      tokens_used: 250,
      cost_usd: 0.00,
      cached: true,
      model: "claude-sonnet",
    }
  }
}

export const mockStreamNarrative = async (
  onChunk: (chunk: NarrativeStreamChunk) => void
): Promise<void> => {
  const narrativeText = "### Architectural Changes Summary\nIn this snapshot, Dan Abramov optimized the scheduling loop inside `ReactFiber.js`. This resolves a critical scheduling bottleneck in React Concurrent Mode.\n\n### Complexity & Coupling Shifts\n* **`packages/react-reconciler/src/ReactFiber.js`**: Average cyclomatic complexity decreased slightly from 19.2 to 18.5.\n* **Coupling**: The dependency bridge between `ReactFiber` and `ReactDOM` remains stable.\n\n### Single Point of Failure (Bus Factor)\n* Sebastian Markbåge is currently the sole reviewer and major contributor to the core reconciler packages."
  
  const words = narrativeText.split(" ")
  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 15))
    onChunk({
      token: words[i] + " ",
      done: i === words.length - 1,
      cost_usd: 0.00
    })
  }
}
