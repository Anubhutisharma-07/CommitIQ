import { useState, useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type ActivityType = "commit" | "review" | "merge" | "issue" | "comment" | "deploy";
type ReviewStatus = "approved" | "changes_requested" | "pending" | "dismissed";
type MemberRole = "lead" | "senior" | "mid" | "junior";

interface TeamActivity {
  id: string;
  type: ActivityType;
  actor: string;
  avatar: string;
  target: string;
  description: string;
  timestamp: string;
  repo: string;
  prNumber?: number;
  reviewStatus?: ReviewStatus;
}

interface CodeReviewStats {
  reviewer: string;
  avatar: string;
  reviewsCompleted: number;
  avgReviewTime: string;
  approvalRate: number;
  commentsGiven: number;
  bugsFound: number;
  suggestionsGiven: number;
  topCategories: string[];
}

interface TeamMember {
  name: string;
  avatar: string;
  role: MemberRole;
  commits: number;
  reviews: number;
  prsOpened: number;
  prsMerged: number;
  issuesClosed: number;
  linesAdded: number;
  linesRemoved: number;
  activeRepos: string[];
  streak: number;
  contributionScore: number;
}

interface PRMetrics {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  repo: string;
  number: number;
  status: "open" | "merged" | "closed";
  reviewers: string[];
  reviewStatus: ReviewStatus;
  additions: number;
  deletions: number;
  comments: number;
  timeToMerge: string;
  createdAt: string;
  labels: string[];
}

interface SprintGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  unit: string;
  assignees: string[];
  deadline: string;
  status: "on-track" | "at-risk" | "behind";
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ACTIVITY_MAP: Record<ActivityType, { icon: string; color: string }> = {
  commit: { icon: "💻", color: "#8b5cf6" },
  review: { icon: "👀", color: "#3b82f6" },
  merge: { icon: "🔀", color: "#10b981" },
  issue: { icon: "🐛", color: "#f59e0b" },
  comment: { icon: "💬", color: "#06b6d4" },
  deploy: { icon: "🚀", color: "#ec4899" },
};

const REVIEW_STATUS_MAP: Record<ReviewStatus, { label: string; color: string; icon: string }> = {
  approved: { label: "Approved", color: "#10b981", icon: "✅" },
  changes_requested: { label: "Changes Requested", color: "#ef4444", icon: "🔄" },
  pending: { label: "Pending", color: "#f59e0b", icon: "⏳" },
  dismissed: { label: "Dismissed", color: "#6b7280", icon: "❌" },
};

const ROLE_MAP: Record<MemberRole, { label: string; color: string }> = {
  lead: { label: "Lead", color: "#8b5cf6" },
  senior: { label: "Senior", color: "#3b82f6" },
  mid: { label: "Mid-Level", color: "#10b981" },
  junior: { label: "Junior", color: "#f59e0b" },
};

// ─── Sample Data ────────────────────────────────────────────────────────────

const SAMPLE_ACTIVITIES: TeamActivity[] = [
  { id: "a1", type: "commit", actor: "Sarah Chen", avatar: "👩‍💻", target: "feat: add OAuth2 authentication", description: "Committed 12 files with 450 additions", timestamp: "2 hours ago", repo: "auth-service", prNumber: 234 },
  { id: "a2", type: "review", actor: "Marcus Johnson", avatar: "👨‍💻", target: "PR #231: Refactor payment processing", description: "Approved with 3 suggestions", timestamp: "3 hours ago", repo: "payment-api", reviewStatus: "approved" },
  { id: "a3", type: "merge", actor: "Priya Patel", avatar: "👩‍🔬", target: "PR #229: Fix memory leak in WebSocket", description: "Merged into main after 2 approvals", timestamp: "4 hours ago", repo: "realtime-engine" },
  { id: "a4", type: "issue", actor: "Alex Kim", avatar: "🧑‍💻", target: "TypeError in dashboard component", description: "Opened issue in frontend-app", timestamp: "5 hours ago", repo: "frontend-app" },
  { id: "a5", type: "comment", actor: "Jordan Lee", avatar: "👨‍🎨", target: "PR #228: Add notification system", description: "Requested changes: needs error boundaries", timestamp: "5 hours ago", repo: "notification-service" },
  { id: "a6", type: "deploy", actor: "Sarah Chen", avatar: "👩‍💻", target: "auth-service v2.3.1", description: "Deployed to production successfully", timestamp: "6 hours ago", repo: "auth-service" },
  { id: "a7", type: "commit", actor: "Marcus Johnson", avatar: "👨‍💻", target: "fix: resolve race condition in queue", description: "Committed 4 files with 85 additions", timestamp: "7 hours ago", repo: "queue-worker", prNumber: 232 },
  { id: "a8", type: "review", actor: "Sarah Chen", avatar: "👩‍💻", target: "PR #230: Update API documentation", description: "Approved - documentation looks great", timestamp: "8 hours ago", repo: "docs", reviewStatus: "approved" },
  { id: "a9", type: "merge", actor: "Priya Patel", avatar: "👩‍🔬", target: "PR #227: Add caching layer", description: "Merged with squash", timestamp: "10 hours ago", repo: "cache-service" },
  { id: "a10", type: "issue", actor: "Jordan Lee", avatar: "👨‍🎨", target: "CSS not loading in dark mode", description: "Closed issue - fixed in #226", timestamp: "12 hours ago", repo: "frontend-app" },
];

const CODE_REVIEWS: CodeReviewStats[] = [
  { reviewer: "Sarah Chen", avatar: "👩‍💻", reviewsCompleted: 48, avgReviewTime: "2.1h", approvalRate: 72, commentsGiven: 156, bugsFound: 12, suggestionsGiven: 89, topCategories: ["Security", "Performance", "Architecture"] },
  { reviewer: "Marcus Johnson", avatar: "👨‍💻", reviewsCompleted: 42, avgReviewTime: "1.8h", approvalRate: 68, commentsGiven: 134, bugsFound: 18, suggestionsGiven: 76, topCategories: ["Testing", "Edge Cases", "Logic"] },
  { reviewer: "Priya Patel", avatar: "👩‍🔬", reviewsCompleted: 38, avgReviewTime: "2.5h", approvalRate: 75, commentsGiven: 98, bugsFound: 8, suggestionsGiven: 65, topCategories: ["Code Quality", "Maintainability", "DRY"] },
  { reviewer: "Alex Kim", avatar: "🧑‍💻", reviewsCompleted: 28, avgReviewTime: "3.2h", approvalRate: 62, commentsGiven: 82, bugsFound: 15, suggestionsGiven: 45, topCategories: ["Performance", "Memory", "Concurrency"] },
  { reviewer: "Jordan Lee", avatar: "👨‍🎨", reviewsCompleted: 22, avgReviewTime: "2.8h", approvalRate: 80, commentsGiven: 56, bugsFound: 5, suggestionsGiven: 38, topCategories: ["UX", "Accessibility", "Design"] },
];

const TEAM_MEMBERS: TeamMember[] = [
  { name: "Sarah Chen", avatar: "👩‍💻", role: "lead", commits: 156, reviews: 48, prsOpened: 42, prsMerged: 38, issuesClosed: 28, linesAdded: 12400, linesRemoved: 3200, activeRepos: ["auth-service", "frontend-app", "docs"], streak: 15, contributionScore: 95 },
  { name: "Marcus Johnson", avatar: "👨‍💻", role: "senior", commits: 142, reviews: 42, prsOpened: 38, prsMerged: 35, issuesClosed: 22, linesAdded: 10800, linesRemoved: 2800, activeRepos: ["queue-worker", "payment-api", "realtime-engine"], streak: 12, contributionScore: 88 },
  { name: "Priya Patel", avatar: "👩‍🔬", role: "senior", commits: 128, reviews: 38, prsOpened: 35, prsMerged: 32, issuesClosed: 18, linesAdded: 9200, linesRemoved: 2400, activeRepos: ["cache-service", "auth-service", "notification-service"], streak: 8, contributionScore: 85 },
  { name: "Alex Kim", avatar: "🧑‍💻", role: "mid", commits: 98, reviews: 28, prsOpened: 25, prsMerged: 22, issuesClosed: 15, linesAdded: 7600, linesRemoved: 1800, activeRepos: ["realtime-engine", "queue-worker"], streak: 5, contributionScore: 72 },
  { name: "Jordan Lee", avatar: "👨‍🎨", role: "junior", commits: 65, reviews: 22, prsOpened: 20, prsMerged: 18, issuesClosed: 12, linesAdded: 4800, linesRemoved: 1200, activeRepos: ["frontend-app"], streak: 3, contributionScore: 65 },
];

const PR_METRICS: PRMetrics[] = [
  { id: "pr1", title: "feat: add OAuth2 authentication with JWT tokens", author: "Sarah Chen", authorAvatar: "👩‍💻", repo: "auth-service", number: 234, status: "open", reviewers: ["Marcus Johnson", "Priya Patel"], reviewStatus: "approved", additions: 450, deletions: 28, comments: 12, timeToMerge: "N/A", createdAt: "2 hours ago", labels: ["feature", "security"] },
  { id: "pr2", title: "fix: resolve memory leak in WebSocket handler", author: "Marcus Johnson", authorAvatar: "👨‍💻", repo: "realtime-engine", number: 231, status: "merged", reviewers: ["Sarah Chen"], reviewStatus: "approved", additions: 85, deletions: 42, comments: 8, timeToMerge: "4.5h", createdAt: "1 day ago", labels: ["bugfix", "performance"] },
  { id: "pr3", title: "refactor: extract shared utilities into common module", author: "Priya Patel", authorAvatar: "👩‍🔬", repo: "frontend-app", number: 229, status: "open", reviewers: ["Sarah Chen", "Jordan Lee"], reviewStatus: "changes_requested", additions: 320, deletions: 280, comments: 15, timeToMerge: "N/A", createdAt: "2 days ago", labels: ["refactor", "cleanup"] },
  { id: "pr4", title: "feat: implement real-time notification system", author: "Alex Kim", authorAvatar: "🧑‍💻", repo: "notification-service", number: 228, status: "open", reviewers: ["Priya Patel"], reviewStatus: "pending", additions: 520, deletions: 15, comments: 5, timeToMerge: "N/A", createdAt: "3 days ago", labels: ["feature", "websocket"] },
  { id: "pr5", title: "docs: update API documentation and add examples", author: "Sarah Chen", authorAvatar: "👩‍💻", repo: "docs", number: 227, status: "merged", reviewers: ["Jordan Lee"], reviewStatus: "approved", additions: 180, deletions: 12, comments: 3, timeToMerge: "2.1h", createdAt: "4 days ago", labels: ["docs"] },
];

const SPRINT_GOALS: SprintGoal[] = [
  { id: "sg1", title: "Authentication Overhaul", description: "Complete OAuth2 implementation with role-based access control", progress: 85, target: 100, unit: "%", assignees: ["Sarah Chen", "Marcus Johnson"], deadline: "Aug 30", status: "on-track" },
  { id: "sg2", title: "Performance Optimization", description: "Reduce API response times by 40% through caching and query optimization", progress: 62, target: 100, unit: "%", assignees: ["Marcus Johnson", "Priya Patel"], deadline: "Sep 1", status: "at-risk" },
  { id: "sg3", title: "Test Coverage Increase", description: "Achieve 90% test coverage across all services", progress: 78, target: 90, unit: "%", assignees: ["Priya Patel", "Alex Kim"], deadline: "Sep 3", status: "on-track" },
  { id: "sg4", title: "Documentation Sprint", description: "Complete API docs and onboarding guides for new team members", progress: 45, target: 100, unit: "%", assignees: ["Jordan Lee", "Sarah Chen"], deadline: "Sep 5", status: "behind" },
];

// ─── Utility Functions ──────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 90) return "#10b981";
  if (score >= 75) return "#3b82f6";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function TeamCollaborationHub() {
  const [activeTab, setActiveTab] = useState<"feed" | "reviews" | "team" | "prs" | "sprint">("feed");
  const [selectedMember, setSelectedMember] = useState<TeamMember>(TEAM_MEMBERS[0]);

  const teamStats = useMemo(() => {
    const totalCommits = TEAM_MEMBERS.reduce((s, m) => s + m.commits, 0);
    const totalPRs = TEAM_MEMBERS.reduce((s, m) => s + m.prsOpened, 0);
    const totalReviews = TEAM_MEMBERS.reduce((s, m) => s + m.reviews, 0);
    const avgScore = Math.round(TEAM_MEMBERS.reduce((s, m) => s + m.contributionScore, 0) / TEAM_MEMBERS.length);
    return { totalCommits, totalPRs, totalReviews, avgScore };
  }, []);

  const tabs = [
    { id: "feed" as const, label: "Activity Feed", icon: "📡" },
    { id: "reviews" as const, label: "Code Reviews", icon: "👀" },
    { id: "team" as const, label: "Team Members", icon: "👥" },
    { id: "prs" as const, label: "Pull Requests", icon: "🔀" },
    { id: "sprint" as const, label: "Sprint Goals", icon: "🎯" },
  ];

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "20px",
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "10px",
    border: active ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.06)",
    background: active ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
    color: active ? "#8b5cf6" : "#94a3b8",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", padding: "24px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 8px", background: "linear-gradient(135deg, #8b5cf6, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            👥 Team Collaboration Hub
          </h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>Track team activity, code reviews, and collaboration metrics</p>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#8b5cf6" }}>{TEAM_MEMBERS.length}</div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Members</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#10b981" }}>{teamStats.totalCommits}</div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Commits</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#3b82f6" }}>{teamStats.totalReviews}</div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Reviews</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button key={tab.id} style={{ ...btnStyle(activeTab === tab.id), padding: "10px 20px" }} onClick={() => setActiveTab(tab.id)}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ ACTIVITY FEED TAB ═══ */}
      {activeTab === "feed" && (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {SAMPLE_ACTIVITIES.map((activity) => {
              const actType = ACTIVITY_MAP[activity.type];
              return (
                <div key={activity.id} style={{ ...cardStyle, display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `${actType.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                    {activity.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: "600" }}>{activity.actor}</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}> {activity.type === "commit" ? "committed to" : activity.type === "review" ? "reviewed" : activity.type === "merge" ? "merged" : activity.type === "issue" ? "opened issue in" : activity.type === "comment" ? "commented on" : "deployed"} </span>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: actType.color }}>{activity.target}</span>
                      </div>
                      <span style={{ fontSize: "10px", color: "#6b7280", whiteSpace: "nowrap" }}>{activity.timestamp}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>{activity.description}</div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "6px", background: "rgba(139,92,246,0.1)", color: "#8b5cf6", fontSize: "10px" }}>{activity.repo}</span>
                      {activity.prNumber && <span style={{ padding: "2px 8px", borderRadius: "6px", background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontSize: "10px" }}>PR #{activity.prNumber}</span>}
                      {activity.reviewStatus && (
                        <span style={{ padding: "2px 8px", borderRadius: "6px", background: `${REVIEW_STATUS_MAP[activity.reviewStatus].color}20`, color: REVIEW_STATUS_MAP[activity.reviewStatus].color, fontSize: "10px" }}>
                          {REVIEW_STATUS_MAP[activity.reviewStatus].icon} {REVIEW_STATUS_MAP[activity.reviewStatus].label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ CODE REVIEWS TAB ═══ */}
      {activeTab === "reviews" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {CODE_REVIEWS.map((review) => (
            <div key={review.reviewer} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={{ fontSize: "28px" }}>{review.avatar}</span>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "14px" }}>{review.reviewer}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>{review.reviewsCompleted} reviews • {review.avgReviewTime} avg</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                {[
                  { label: "Approval", value: `${review.approvalRate}%`, color: review.approvalRate >= 70 ? "#10b981" : "#f59e0b" },
                  { label: "Bugs Found", value: review.bugsFound.toString(), color: "#ef4444" },
                  { label: "Suggestions", value: review.suggestionsGiven.toString(), color: "#3b82f6" },
                ].map((stat, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: "9px", color: "#94a3b8" }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#94a3b8", marginBottom: "4px" }}>
                  <span>Approval Rate</span>
                  <span>{review.approvalRate}%</span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${review.approvalRate}%`, background: review.approvalRate >= 70 ? "#10b981" : "#f59e0b", borderRadius: "2px" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {review.topCategories.map((cat) => (
                  <span key={cat} style={{ padding: "2px 6px", borderRadius: "4px", background: "rgba(139,92,246,0.1)", color: "#8b5cf6", fontSize: "9px" }}>{cat}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ TEAM MEMBERS TAB ═══ */}
      {activeTab === "team" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
          {/* Member List */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 12px", fontSize: "14px" }}>👥 Team Members</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {TEAM_MEMBERS.map((member) => (
                <div key={member.name} style={{ padding: "10px", borderRadius: "10px", background: selectedMember.name === member.name ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)", border: selectedMember.name === member.name ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }} onClick={() => setSelectedMember(member)}>
                  <span style={{ fontSize: "24px" }}>{member.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", fontWeight: "600" }}>{member.name}</div>
                    <div style={{ fontSize: "10px", color: ROLE_MAP[member.role].color }}>{ROLE_MAP[member.role].label}</div>
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: getScoreColor(member.contributionScore) }}>{member.contributionScore}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Member Detail */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span style={{ fontSize: "40px" }}>{selectedMember.avatar}</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px" }}>{selectedMember.name}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ padding: "2px 8px", borderRadius: "6px", background: `${ROLE_MAP[selectedMember.role].color}20`, color: ROLE_MAP[selectedMember.role].color, fontSize: "10px", fontWeight: "700" }}>{ROLE_MAP[selectedMember.role].label}</span>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>🔥 {selectedMember.streak} day streak</span>
                </div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{ fontSize: "28px", fontWeight: "900", color: getScoreColor(selectedMember.contributionScore) }}>{selectedMember.contributionScore}</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>Contribution Score</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
              {[
                { label: "Commits", value: selectedMember.commits, color: "#8b5cf6", icon: "💻" },
                { label: "Reviews", value: selectedMember.reviews, color: "#3b82f6", icon: "👀" },
                { label: "PRs Merged", value: selectedMember.prsMerged, color: "#10b981", icon: "🔀" },
                { label: "Issues Closed", value: selectedMember.issuesClosed, color: "#f59e0b", icon: "🐛" },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: "center", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ fontSize: "16px", marginBottom: "4px" }}>{stat.icon}</div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Lines Changed */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>📝 Lines Changed</div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "rgba(16,185,129,0.08)", textAlign: "center" }}>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#10b981" }}>+{selectedMember.linesAdded.toLocaleString()}</div>
                  <div style={{ fontSize: "9px", color: "#94a3b8" }}>Added</div>
                </div>
                <div style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", textAlign: "center" }}>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#ef4444" }}>-{selectedMember.linesRemoved.toLocaleString()}</div>
                  <div style={{ fontSize: "9px", color: "#94a3b8" }}>Removed</div>
                </div>
                <div style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "rgba(139,92,246,0.08)", textAlign: "center" }}>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#8b5cf6" }}>+{(selectedMember.linesAdded - selectedMember.linesRemoved).toLocaleString()}</div>
                  <div style={{ fontSize: "9px", color: "#94a3b8" }}>Net</div>
                </div>
              </div>
            </div>

            {/* Active Repos */}
            <div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>📂 Active Repositories</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {selectedMember.activeRepos.map((repo) => (
                  <span key={repo} style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(139,92,246,0.1)", color: "#8b5cf6", fontSize: "11px", fontWeight: "600" }}>{repo}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PULL REQUESTS TAB ═══ */}
      {activeTab === "prs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {PR_METRICS.map((pr) => {
            const statusColor = pr.status === "merged" ? "#10b981" : pr.status === "open" ? "#3b82f6" : "#ef4444";
            const reviewStatus = REVIEW_STATUS_MAP[pr.reviewStatus];
            return (
              <div key={pr.id} style={{ ...cardStyle, border: `1px solid ${statusColor}30` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "16px" }}>{pr.authorAvatar}</span>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>{pr.repo} #{pr.number}</span>
                      <span style={{ padding: "2px 8px", borderRadius: "6px", background: `${statusColor}20`, color: statusColor, fontSize: "9px", fontWeight: "700", textTransform: "uppercase" }}>{pr.status}</span>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>{pr.title}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ padding: "3px 10px", borderRadius: "6px", background: `${reviewStatus.color}15`, color: reviewStatus.color, fontSize: "10px", fontWeight: "700" }}>
                      {reviewStatus.icon} {reviewStatus.label}
                    </div>
                    <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>{pr.timeToMerge !== "N/A" ? `Merged in ${pr.timeToMerge}` : `Opened ${pr.createdAt}`}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "11px", color: "#94a3b8" }}>
                  <span style={{ color: "#10b981" }}>+{pr.additions}</span>
                  <span style={{ color: "#ef4444" }}>-{pr.deletions}</span>
                  <span>💬 {pr.comments}</span>
                  <span>👀 {pr.reviewers.length} reviewers</span>
                </div>
                <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
                  {pr.labels.map((label) => (
                    <span key={label} style={{ padding: "2px 8px", borderRadius: "6px", background: "rgba(139,92,246,0.1)", color: "#8b5cf6", fontSize: "9px" }}>{label}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ SPRINT GOALS TAB ═══ */}
      {activeTab === "sprint" && (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {SPRINT_GOALS.map((goal) => {
              const statusColors = { "on-track": "#10b981", "at-risk": "#f59e0b", "behind": "#ef4444" };
              const statusLabels = { "on-track": "On Track", "at-risk": "At Risk", "behind": "Behind" };
              return (
                <div key={goal.id} style={{ ...cardStyle, border: `1px solid ${statusColors[goal.status]}30` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px", fontSize: "16px" }}>{goal.title}</h3>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>{goal.description}</div>
                    </div>
                    <span style={{ padding: "4px 12px", borderRadius: "8px", background: `${statusColors[goal.status]}20`, color: statusColors[goal.status], fontSize: "11px", fontWeight: "700" }}>
                      {statusLabels[goal.status]}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                    <span>Progress: <strong style={{ color: statusColors[goal.status] }}>{goal.progress}{goal.unit}</strong> / {goal.target}{goal.unit}</span>
                    <span>Deadline: {goal.deadline}</span>
                  </div>

                  <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden", marginBottom: "10px" }}>
                    <div style={{ height: "100%", width: `${(goal.progress / goal.target) * 100}%`, background: statusColors[goal.status], borderRadius: "4px", transition: "width 0.5s" }} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {goal.assignees.map((name) => {
                        const member = TEAM_MEMBERS.find((m) => m.name === name);
                        return (
                          <span key={name} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", fontSize: "10px" }}>
                            {member?.avatar} {name}
                          </span>
                        );
                      })}
                    </div>
                    <span style={{ fontSize: "20px", fontWeight: "800", color: statusColors[goal.status] }}>{Math.round((goal.progress / goal.target) * 100)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
