/**
 * CommitHealthRadar.tsx
 * 
 * Multi-dimensional commit health scoring dashboard with:
 * - 6-axis radar visualization (purity, impact, quality, consistency, collaboration, velocity)
 * - Health grade system (A+ to F)
 * - Dimension detail cards with scores and trends
 * - AI-powered recommendations
 * - Historical health trend sparkline
 * - Team comparison view
 */

import { useState, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HealthDimension {
  id: string
  label: string
  icon: string
  score: number // 0-100
  trend: 'up' | 'down' | 'stable'
  trendDelta: number
  description: string
  details: string[]
  color: string
}

interface HealthGrade {
  grade: string
  label: string
  color: string
  minScore: number
}

interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  category: string
}

interface TeamMember {
  name: string
  avatar: string
  overallScore: number
  dimensions: number[]
}

interface CommitHealthRadarProps {
  repoSlug?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HEALTH_GRADES: HealthGrade[] = [
  { grade: 'A+', label: 'Exceptional', color: '#22c55e', minScore: 95 },
  { grade: 'A', label: 'Excellent', color: '#22c55e', minScore: 85 },
  { grade: 'B+', label: 'Very Good', color: '#84cc16', minScore: 75 },
  { grade: 'B', label: 'Good', color: '#eab308', minScore: 65 },
  { grade: 'C+', label: 'Above Average', color: '#f97316', minScore: 55 },
  { grade: 'C', label: 'Average', color: '#f97316', minScore: 45 },
  { grade: 'D', label: 'Below Average', color: '#ef4444', minScore: 35 },
  { grade: 'F', label: 'Needs Work', color: '#ef4444', minScore: 0 },
]

const DIMENSION_COLORS = [
  '#8b5cf6', // purple - purity
  '#3b82f6', // blue - impact
  '#22c55e', // green - quality
  '#f59e0b', // amber - consistency
  '#ec4899', // pink - collaboration
  '#06b6d4', // cyan - velocity
]

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

function generateMockDimensions(): HealthDimension[] {
  return [
    {
      id: 'purity',
      label: 'Commit Purity',
      icon: '💎',
      score: 82,
      trend: 'up',
      trendDelta: 5,
      description: 'How focused and single-purpose each commit is',
      details: [
        'Avg files changed per commit: 3.2 (target: <5)',
        '85% of commits touch related files only',
        '12% of commits are "fix typo" or trivial',
        'Commit message clarity score: 78/100',
      ],
      color: DIMENSION_COLORS[0],
    },
    {
      id: 'impact',
      label: 'Code Impact',
      icon: '💥',
      score: 71,
      trend: 'up',
      trendDelta: 3,
      description: 'Business value and significance of changes',
      details: [
        '34% of commits are feature additions',
        '28% are bug fixes (healthy ratio)',
        '18% are refactoring (good maintenance)',
        '20% are chore/config (acceptable)',
      ],
      color: DIMENSION_COLORS[1],
    },
    {
      id: 'quality',
      label: 'Code Quality',
      icon: '✨',
      score: 76,
      trend: 'stable',
      trendDelta: 0,
      description: 'Code quality indicators in commits',
      details: [
        'Test coverage in commits: 67%',
        'Lint passes on 91% of commits',
        'Type errors in 4% of commits',
        'Average PR review comments: 2.3',
      ],
      color: DIMENSION_COLORS[2],
    },
    {
      id: 'consistency',
      label: 'Consistency',
      icon: '📊',
      score: 68,
      trend: 'down',
      trendDelta: -4,
      description: 'Regularity and predictability of commit patterns',
      details: [
        'Commits per week: 12.4 (down from 15.1)',
        'Weekend commits: 18% (burnout risk)',
        'Avg time between commits: 4.2 hours',
        'Commit time distribution: 72% business hours',
      ],
      color: DIMENSION_COLORS[3],
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      icon: '🤝',
      score: 85,
      trend: 'up',
      trendDelta: 7,
      description: 'Team collaboration and knowledge sharing',
      details: [
        'Cross-team commits: 23%',
        'PR approval rate: 94%',
        'Average review turnaround: 6.2 hours',
        'Co-authored commits: 31%',
      ],
      color: DIMENSION_COLORS[4],
    },
    {
      id: 'velocity',
      label: 'Delivery Velocity',
      icon: '🚀',
      score: 74,
      trend: 'up',
      trendDelta: 2,
      description: 'Speed and efficiency of code delivery',
      details: [
        'Lead time: 2.1 days (target: <3)',
        'Deployment frequency: 4.2/week',
        'Change failure rate: 8% (target: <15%)',
        'Mean time to recovery: 1.8 hours',
      ],
      color: DIMENSION_COLORS[5],
    },
  ]
}

function generateMockRecommendations(): Recommendation[] {
  return [
    {
      priority: 'critical',
      title: 'Reduce weekend commits',
      description: '18% of commits occur on weekends, indicating potential burnout. Aim for <10%.',
      impact: 'Improves team health score by ~12 points',
      category: 'consistency',
    },
    {
      priority: 'high',
      title: 'Increase test coverage in commits',
      description: 'Only 67% of commits include test changes. Target 80%+ for feature commits.',
      impact: 'Improves quality score by ~8 points',
      category: 'quality',
    },
    {
      priority: 'high',
      title: 'Break up large commits',
      description: '15% of commits touch >10 files. Consider splitting into smaller, focused changes.',
      impact: 'Improves purity score by ~6 points',
      category: 'purity',
    },
    {
      priority: 'medium',
      title: 'Improve commit message conventions',
      description: '22% of commits lack conventional commit format (feat:, fix:, etc.).',
      impact: 'Improves code navigation and changelog generation',
      category: 'purity',
    },
    {
      priority: 'medium',
      title: 'Increase cross-team collaboration',
      description: 'Currently 23% cross-team. Target 30% for better knowledge distribution.',
      impact: 'Reduces bus factor risk',
      category: 'collaboration',
    },
    {
      priority: 'low',
      title: 'Optimize commit timing',
      description: 'Cluster commits into focused work blocks rather than scattered throughout the day.',
      impact: 'Improves flow state and reduces context switching',
      category: 'velocity',
    },
  ]
}

function generateMockTeamMembers(): TeamMember[] {
  return [
    { name: 'Alice Chen', avatar: '👩‍💻', overallScore: 88, dimensions: [90, 85, 82, 78, 92, 86] },
    { name: 'Bob Smith', avatar: '👨‍💻', overallScore: 76, dimensions: [72, 80, 78, 70, 75, 74] },
    { name: 'Carol White', avatar: '👩‍🔬', overallScore: 82, dimensions: [85, 78, 88, 75, 80, 72] },
    { name: 'David Brown', avatar: '🧑‍💻', overallScore: 71, dimensions: [68, 72, 70, 80, 65, 78] },
    { name: 'Eva Martinez', avatar: '👩‍🎨', overallScore: 85, dimensions: [88, 82, 80, 72, 90, 82] },
  ]
}

function generateMockTrend(): number[] {
  return [62, 65, 68, 64, 70, 72, 69, 73, 75, 74, 76, 78, 75, 77, 76, 78, 80, 77, 79, 81, 78, 76, 77, 79]
}

// ---------------------------------------------------------------------------
// SVG Radar Chart
// ---------------------------------------------------------------------------

function RadarChart({ dimensions, size = 300 }: { dimensions: HealthDimension[]; size?: number }) {
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.38
  const n = dimensions.length
  const angleStep = (2 * Math.PI) / n

  // Grid circles
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]
  const gridCircles = gridLevels.map((level) => {
    const r = radius * level
    const points = Array.from({ length: n }, (_, i) => {
      const angle = i * angleStep - Math.PI / 2
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
    }).join(' ')
    return (
      <polygon
        key={level}
        points={points}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />
    )
  })

  // Axis lines
  const axisLines = dimensions.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2
    return (
      <line
        key={i}
        x1={cx}
        y1={cy}
        x2={cx + radius * Math.cos(angle)}
        y2={cy + radius * Math.sin(angle)}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />
    )
  })

  // Labels
  const labels = dimensions.map((dim, i) => {
    const angle = i * angleStep - Math.PI / 2
    const labelR = radius + 24
    const x = cx + labelR * Math.cos(angle)
    const y = cy + labelR * Math.sin(angle)
    return (
      <text
        key={i}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.7)"
        fontSize="10"
        fontWeight="600"
      >
        {dim.icon} {dim.label.split(' ')[0]}
      </text>
    )
  })

  // Data polygon
  const dataPoints = dimensions.map((dim, i) => {
    const angle = i * angleStep - Math.PI / 2
    const r = (dim.score / 100) * radius
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')

  // Data dots
  const dataDots = dimensions.map((dim, i) => {
    const angle = i * angleStep - Math.PI / 2
    const r = (dim.score / 100) * radius
    return (
      <circle
        key={i}
        cx={cx + r * Math.cos(angle)}
        cy={cy + r * Math.sin(angle)}
        r="4"
        fill={dim.color}
        stroke="white"
        strokeWidth="2"
      />
    )
  })

  // Score labels on dots
  const scoreLabels = dimensions.map((dim, i) => {
    const angle = i * angleStep - Math.PI / 2
    const r = (dim.score / 100) * radius + 14
    return (
      <text
        key={i}
        x={cx + r * Math.cos(angle)}
        y={cy + r * Math.sin(angle)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={dim.color}
        fontSize="11"
        fontWeight="700"
      >
        {dim.score}
      </text>
    )
  })

  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
      {gridCircles}
      {axisLines}
      <polygon
        points={dataPoints}
        fill="rgba(139, 92, 246, 0.15)"
        stroke="rgba(139, 92, 246, 0.8)"
        strokeWidth="2"
      />
      {dataDots}
      {scoreLabels}
      {labels}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Sparkline
// ---------------------------------------------------------------------------

function Sparkline({ values, color = '#8b5cf6', width = 200, height = 40 }: {
  values: number[]; color?: string; width?: number; height?: number
}) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const padding = 4

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - padding * 2) + padding
    const y = height - padding - ((v - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width - padding} cy={height - padding - ((values[values.length - 1] - min) / range) * (height - padding * 2)} r="3" fill={color} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Grade calculation
// ---------------------------------------------------------------------------

function getGrade(score: number): HealthGrade {
  return HEALTH_GRADES.find((g) => score >= g.minScore) || HEALTH_GRADES[HEALTH_GRADES.length - 1]
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CommitHealthRadar({ repoSlug }: CommitHealthRadarProps) {
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null)
  const [showTeam, setShowTeam] = useState(false)

  const dimensions = useMemo(() => generateMockDimensions(), [])
  const recommendations = useMemo(() => generateMockRecommendations(), [])
  const teamMembers = useMemo(() => generateMockTeamMembers(), [])
  const trend = useMemo(() => generateMockTrend(), [])

  const overallScore = useMemo(() => {
    const weights = [0.2, 0.18, 0.2, 0.12, 0.15, 0.15]
    return Math.round(
      dimensions.reduce((sum, dim, i) => sum + dim.score * weights[i], 0)
    )
  }, [dimensions])

  const grade = getGrade(overallScore)
  const selected = dimensions.find((d) => d.id === selectedDimension)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🎯</span> Commit Health Radar
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Multi-dimensional analysis of your repository's commit health
            {repoSlug && <span className="ml-2 text-purple-400">• {repoSlug}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTeam(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !showTeam ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setShowTeam(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showTeam ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Team View
          </button>
        </div>
      </div>

      {/* Overall Score + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center">
          <div
            className="text-6xl font-black mb-2"
            style={{ color: grade.color }}
          >
            {grade.grade}
          </div>
          <div className="text-3xl font-bold text-white mb-1">{overallScore}/100</div>
          <div className="text-sm text-slate-400 mb-4">{grade.label}</div>
          <Sparkline values={trend} color={grade.color} width={180} height={50} />
          <div className="text-xs text-slate-500 mt-2">24-week trend</div>
        </div>

        {/* Radar Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex items-center justify-center">
          <div className="w-full max-w-md">
            <RadarChart dimensions={dimensions} size={320} />
          </div>
        </div>
      </div>

      {/* Dimension Cards */}
      {!showTeam && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dimensions.map((dim) => (
            <button
              key={dim.id}
              onClick={() => setSelectedDimension(selectedDimension === dim.id ? null : dim.id)}
              className={`glass-panel rounded-xl p-4 text-left transition-all hover:border-purple-500/30 ${
                selectedDimension === dim.id ? 'border-purple-500/50 bg-purple-500/5' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{dim.icon}</span>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-xs ${
                      dim.trend === 'up' ? 'text-green-400' : dim.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                    }`}
                  >
                    {dim.trend === 'up' ? '↑' : dim.trend === 'down' ? '↓' : '→'} {Math.abs(dim.trendDelta)}
                  </span>
                </div>
              </div>
              <div className="text-sm font-semibold text-white mb-1">{dim.label}</div>
              <div className="text-2xl font-bold mb-2" style={{ color: dim.color }}>
                {dim.score}
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${dim.score}%`, backgroundColor: dim.color }}
                />
              </div>
              {selectedDimension === dim.id && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                  <p className="text-xs text-slate-400">{dim.description}</p>
                  {dim.details.map((detail, i) => (
                    <p key={i} className="text-xs text-slate-300">• {detail}</p>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Team View */}
      {showTeam && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">👥 Team Health Comparison</h3>
          <div className="space-y-3">
            {teamMembers
              .sort((a, b) => b.overallScore - a.overallScore)
              .map((member) => {
                const memberGrade = getGrade(member.overallScore)
                return (
                  <div key={member.name} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                    <span className="text-2xl">{member.avatar}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{member.name}</div>
                      <div className="flex gap-1 mt-1">
                        {member.dimensions.map((score, i) => (
                          <div
                            key={i}
                            className="h-2 rounded-full"
                            style={{
                              width: '32px',
                              backgroundColor: DIMENSION_COLORS[i],
                              opacity: 0.3 + (score / 100) * 0.7,
                            }}
                            title={`${dimensions[i]?.label}: ${score}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: memberGrade.color }}>
                        {member.overallScore}
                      </div>
                      <div className="text-xs" style={{ color: memberGrade.color }}>
                        {memberGrade.grade}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {!showTeam && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">💡 Health Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => {
              const priorityColors = {
                critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: '🔴' },
                high: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: '🟠' },
                medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: '🟡' },
                low: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: '🔵' },
              }
              const pc = priorityColors[rec.priority]
              return (
                <div
                  key={i}
                  className={`${pc.bg} border ${pc.border} rounded-lg p-4`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{pc.badge}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{rec.title}</div>
                      <p className="text-xs text-slate-400 mt-1">{rec.description}</p>
                      <p className={`text-xs ${pc.text} mt-1`}>📈 {rec.impact}</p>
                    </div>
                    <span className="text-xs text-slate-500 uppercase">{rec.category}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Health Trend */}
      {!showTeam && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">📈 Health Score Trend (24 weeks)</h3>
          <div className="flex items-end gap-1 h-32">
            {trend.map((value, i) => {
              const g = getGrade(value)
              const height = ((value - 50) / 50) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t transition-all hover:opacity-80"
                    style={{
                      height: `${Math.max(height, 5)}%`,
                      backgroundColor: g.color,
                      opacity: i === trend.length - 1 ? 1 : 0.6,
                    }}
                    title={`Week ${i + 1}: ${value}`}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>24 weeks ago</span>
            <span>Today</span>
          </div>
        </div>
      )}
    </div>
  )
}
