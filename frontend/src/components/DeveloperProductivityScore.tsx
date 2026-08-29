/**
 * DeveloperProductivityScore.tsx
 *
 * Developer productivity analytics dashboard with:
 * - Individual productivity scoring (multidimensional)
 * - Commit velocity trends
 * - Code review efficiency
 * - Work-life balance indicators
 * - Personalized improvement suggestions
 * - Team comparison view
 */

import { useState, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DeveloperProfile {
  name: string
  avatar: string
  overallScore: number
  dimensions: ProductivityDimension[]
  velocity: number[]
  weeklyHours: number[]
  metrics: DeveloperMetrics
  insights: string[]
}

interface ProductivityDimension {
  label: string
  icon: string
  score: number
  trend: 'up' | 'down' | 'stable'
  description: string
  color: string
}

interface DeveloperMetrics {
  commitsThisWeek: number
  commitsTrend: number
  linesNet: number
  prsOpened: number
  prsReviewed: number
  issuesClosed: number
  avgCommitSize: number
  deployFrequency: number
  bugFixRatio: number
  focusTime: number
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

function generateMockDevelopers(): DeveloperProfile[] {
  return [
    {
      name: 'Alice Chen', avatar: '👩‍💻', overallScore: 91,
      dimensions: [
        { label: 'Velocity', icon: '⚡', score: 88, trend: 'up', description: 'Consistent commit pace with increasing output', color: '#8b5cf6' },
        { label: 'Quality', icon: '✨', score: 94, trend: 'stable', description: 'Low bug rate, high test coverage in commits', color: '#22c55e' },
        { label: 'Review Speed', icon: '⏱️', score: 85, trend: 'up', description: 'Reviews PRs within 2 hours on average', color: '#3b82f6' },
        { label: 'Collaboration', icon: '🤝', score: 92, trend: 'up', description: 'High co-author rate, helpful review comments', color: '#ec4899' },
        { label: 'Focus', icon: '🎯', score: 89, trend: 'stable', description: 'Dedicated work blocks with minimal context switching', color: '#f59e0b' },
        { label: 'Impact', icon: '💥', score: 95, trend: 'up', description: 'High-impact features, critical bug fixes', color: '#06b6d4' },
      ],
      velocity: [12, 15, 18, 14, 16, 20, 19, 22, 18, 21, 23, 25],
      weeklyHours: [42, 44, 40, 43, 45, 41, 38, 42, 44, 40, 43, 41],
      metrics: { commitsThisWeek: 23, commitsTrend: 12, linesNet: 1840, prsOpened: 4, prsReviewed: 8, issuesClosed: 6, avgCommitSize: 85, deployFrequency: 2.1, bugFixRatio: 0.15, focusTime: 6.2 },
      insights: ['Your commit quality is exceptional — keep up the high test coverage!', 'Consider mentoring newer team members to increase your collaboration impact.', 'Your velocity has increased 25% over 12 weeks — sustainable growth.'],
    },
    {
      name: 'Bob Smith', avatar: '👨‍💻', overallScore: 74,
      dimensions: [
        { label: 'Velocity', icon: '⚡', score: 78, trend: 'stable', description: 'Steady commit pace, occasionally bursts', color: '#8b5cf6' },
        { label: 'Quality', icon: '✨', score: 72, trend: 'down', description: 'Some commits lack tests, occasional lint failures', color: '#22c55e' },
        { label: 'Review Speed', icon: '⏱️', score: 65, trend: 'down', description: 'Reviews take 5+ hours average', color: '#3b82f6' },
        { label: 'Collaboration', icon: '🤝', score: 70, trend: 'stable', description: 'Moderate co-author rate, some helpful reviews', color: '#ec4899' },
        { label: 'Focus', icon: '🎯', score: 82, trend: 'up', description: 'Good work blocks, improving context switching', color: '#f59e0b' },
        { label: 'Impact', icon: '💥', score: 76, trend: 'stable', description: 'Consistent feature delivery', color: '#06b6d4' },
      ],
      velocity: [10, 12, 8, 11, 14, 10, 13, 12, 9, 11, 12, 10],
      weeklyHours: [45, 48, 42, 46, 50, 44, 47, 43, 49, 45, 44, 46],
      metrics: { commitsThisWeek: 10, commitsTrend: -5, linesNet: 620, prsOpened: 2, prsReviewed: 3, issuesClosed: 4, avgCommitSize: 120, deployFrequency: 1.2, bugFixRatio: 0.22, focusTime: 4.8 },
      insights: ['Review turnaround is below target — try to review PRs within 3 hours.', 'Your commit sizes are large — consider breaking into smaller focused changes.', 'Weekend work is increasing — watch for burnout signs.'],
    },
    {
      name: 'Carol White', avatar: '👩‍🔬', overallScore: 83,
      dimensions: [
        { label: 'Velocity', icon: '⚡', score: 80, trend: 'up', description: 'Increasing commit frequency', color: '#8b5cf6' },
        { label: 'Quality', icon: '✨', score: 88, trend: 'up', description: 'Excellent test coverage, clean code', color: '#22c55e' },
        { label: 'Review Speed', icon: '⏱️', score: 82, trend: 'stable', description: 'Consistent review turnaround', color: '#3b82f6' },
        { label: 'Collaboration', icon: '🤝', score: 78, trend: 'up', description: 'Growing cross-module contributions', color: '#ec4899' },
        { label: 'Focus', icon: '🎯', score: 85, trend: 'stable', description: 'Deep work sessions on complex features', color: '#f59e0b' },
        { label: 'Impact', icon: '💥', score: 82, trend: 'up', description: 'Database improvements reducing query times 40%', color: '#06b6d4' },
      ],
      velocity: [8, 10, 12, 11, 14, 13, 15, 14, 16, 15, 17, 18],
      weeklyHours: [40, 42, 39, 41, 43, 40, 38, 41, 42, 40, 41, 39],
      metrics: { commitsThisWeek: 18, commitsTrend: 20, linesNet: 1420, prsOpened: 3, prsReviewed: 5, issuesClosed: 5, avgCommitSize: 78, deployFrequency: 1.8, bugFixRatio: 0.12, focusTime: 5.8 },
      insights: ['Your velocity is trending upward sustainably — great growth!', 'Database expertise is your superpower — consider writing internal docs.', 'Your bug fix ratio is the lowest on the team — excellent code quality.'],
    },
    {
      name: 'David Brown', avatar: '🧑‍💻', overallScore: 62,
      dimensions: [
        { label: 'Velocity', icon: '⚡', score: 55, trend: 'down', description: 'Declining commit frequency', color: '#8b5cf6' },
        { label: 'Quality', icon: '✨', score: 68, trend: 'stable', description: 'Adequate but needs more tests', color: '#22c55e' },
        { label: 'Review Speed', icon: '⏱️', score: 60, trend: 'down', description: 'Slow review turnaround, backlog growing', color: '#3b82f6' },
        { label: 'Collaboration', icon: '🤝', score: 58, trend: 'down', description: 'Low cross-module work, minimal co-authoring', color: '#ec4899' },
        { label: 'Focus', icon: '🎯', score: 72, trend: 'stable', description: 'Some context switching issues', color: '#f59e0b' },
        { label: 'Impact', icon: '💥', score: 65, trend: 'down', description: 'DevOps improvements but limited feature work', color: '#06b6d4' },
      ],
      velocity: [14, 12, 10, 8, 9, 7, 8, 6, 7, 5, 6, 5],
      weeklyHours: [50, 52, 48, 55, 50, 53, 48, 51, 54, 50, 49, 52],
      metrics: { commitsThisWeek: 5, commitsTrend: -30, linesNet: 280, prsOpened: 1, prsReviewed: 2, issuesClosed: 2, avgCommitSize: 58, deployFrequency: 0.8, bugFixRatio: 0.35, focusTime: 3.5 },
      insights: ['⚠️ Your velocity has declined 64% over 12 weeks — consider discussing workload.', 'PR review backlog is growing — prioritize reviews this week.', 'Long hours detected — work-life balance needs attention.'],
    },
    {
      name: 'Eva Martinez', avatar: '👩‍🎨', overallScore: 87,
      dimensions: [
        { label: 'Velocity', icon: '⚡', score: 82, trend: 'up', description: 'Strong and increasing velocity', color: '#8b5cf6' },
        { label: 'Quality', icon: '✨', score: 90, trend: 'up', description: 'Excellent security-focused code quality', color: '#22c55e' },
        { label: 'Review Speed', icon: '⏱️', score: 88, trend: 'up', description: 'Fast, thorough reviews', color: '#3b82f6' },
        { label: 'Collaboration', icon: '🤝', score: 85, trend: 'up', description: 'High cross-module contribution rate', color: '#ec4899' },
        { label: 'Focus', icon: '🎯', score: 84, trend: 'stable', description: 'Consistent deep work blocks', color: '#f59e0b' },
        { label: 'Impact', icon: '💥', score: 91, trend: 'up', description: 'Critical security fixes, auth improvements', color: '#06b6d4' },
      ],
      velocity: [11, 13, 15, 14, 16, 17, 18, 19, 17, 20, 21, 22],
      weeklyHours: [41, 43, 40, 42, 44, 41, 39, 42, 43, 40, 41, 42],
      metrics: { commitsThisWeek: 22, commitsTrend: 18, linesNet: 1650, prsOpened: 5, prsReviewed: 7, issuesClosed: 8, avgCommitSize: 72, deployFrequency: 2.4, bugFixRatio: 0.10, focusTime: 5.9 },
      insights: ['Your security expertise is invaluable — consider leading security reviews.', 'Review speed is the best on the team — 1.5 hour average turnaround!', 'Bug fix ratio of 10% is exceptional — you write very stable code.'],
    },
  ]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getScoreColor(score: number) {
  if (score >= 85) return '#22c55e'
  if (score >= 70) return '#eab308'
  if (score >= 50) return '#f97316'
  return '#ef4444'
}

function getGrade(score: number): string {
  if (score >= 95) return 'A+'
  if (score >= 90) return 'A'
  if (score >= 85) return 'B+'
  if (score >= 80) return 'B'
  if (score >= 75) return 'B-'
  if (score >= 70) return 'C+'
  if (score >= 65) return 'C'
  if (score >= 60) return 'C-'
  if (score >= 50) return 'D'
  return 'F'
}

// ---------------------------------------------------------------------------
// Mini Sparkline
// ---------------------------------------------------------------------------

function MiniSparkline({ values, color = '#8b5cf6', height = 32 }: { values: number[]; color?: string; height?: number }) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const width = 120
  const pad = 2

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - pad * 2) + pad
    const y = height - pad - ((v - min) / range) * (height - pad * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width - pad} cy={height - pad - ((values[values.length - 1] - min) / range) * (height - pad * 2)} r="2.5" fill={color} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function DeveloperProductivityScore() {
  const [selectedDev, setSelectedDev] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  const developers = useMemo(() => generateMockDevelopers(), [])
  const selected = developers.find((d) => d.name === selectedDev)

  const teamAvgScore = Math.round(developers.reduce((sum, d) => sum + d.overallScore, 0) / developers.length)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">📊</span> Developer Productivity Score
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Individual developer metrics, productivity trends, and personalized insights
          </p>
        </div>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            showComparison ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          {showComparison ? '👤 Individual' : '👥 Compare All'}
        </button>
      </div>

      {/* Team Average */}
      <div className="glass-panel rounded-xl p-4 flex items-center gap-4">
        <div>
          <div className="text-xs text-slate-400 uppercase">Team Average</div>
          <div className="text-2xl font-bold" style={{ color: getScoreColor(teamAvgScore) }}>{teamAvgScore}/100</div>
        </div>
        <div className="text-xs text-slate-400">|</div>
        <div className="text-xs text-slate-300">{developers.length} developers • Grade: {getGrade(teamAvgScore)}</div>
      </div>

      {/* Comparison View */}
      {showComparison && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">👥 Team Productivity Comparison</h3>
          <div className="space-y-3">
            {developers.sort((a, b) => b.overallScore - a.overallScore).map((dev) => {
              const color = getScoreColor(dev.overallScore)
              return (
                <div key={dev.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                  <span className="text-xl">{dev.avatar}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{dev.name}</div>
                    <div className="flex gap-0.5 mt-1">
                      {dev.dimensions.map((dim, i) => (
                        <div key={i} className="h-1.5 rounded-full" style={{ width: '24px', backgroundColor: dim.color, opacity: 0.3 + (dim.score / 100) * 0.7 }} title={`${dim.label}: ${dim.score}`} />
                      ))}
                    </div>
                  </div>
                  <MiniSparkline values={dev.velocity} color={color} />
                  <div className="text-right w-16">
                    <div className="text-lg font-bold" style={{ color }}>{dev.overallScore}</div>
                    <div className="text-xs" style={{ color }}>{getGrade(dev.overallScore)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Developer Cards */}
      {!showComparison && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {developers.sort((a, b) => b.overallScore - a.overallScore).map((dev) => {
            const color = getScoreColor(dev.overallScore)
            return (
              <button
                key={dev.name}
                onClick={() => setSelectedDev(selectedDev === dev.name ? null : dev.name)}
                className={`glass-panel rounded-xl p-4 text-left transition-all hover:border-purple-500/30 ${
                  selectedDev === dev.name ? 'border-purple-500/50 bg-purple-500/5' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{dev.avatar}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{dev.name}</div>
                    <div className="text-xs text-slate-400">{dev.metrics.commitsThisWeek} commits this week</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black" style={{ color }}>{dev.overallScore}</div>
                    <div className="text-xs" style={{ color }}>{getGrade(dev.overallScore)}</div>
                  </div>
                </div>

                {/* Dimension bars */}
                <div className="space-y-1.5">
                  {dev.dimensions.map((dim) => (
                    <div key={dim.label} className="flex items-center gap-2">
                      <span className="text-xs w-5">{dim.icon}</span>
                      <span className="text-xs text-slate-400 w-16">{dim.label}</span>
                      <div className="flex-1 bg-white/5 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${dim.score}%`, backgroundColor: dim.color }} />
                      </div>
                      <span className="text-xs font-semibold w-8 text-right" style={{ color: dim.color }}>{dim.score}</span>
                    </div>
                  ))}
                </div>

                {/* Sparkline */}
                <div className="mt-3 flex justify-center">
                  <MiniSparkline values={dev.velocity} color={color} height={28} />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Selected Developer Detail */}
      {selected && !showComparison && (
        <div className="space-y-4">
          {/* Metrics Grid */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              {selected.avatar} {selected.name} — Detailed Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Commits/Week', value: selected.metrics.commitsThisWeek, icon: '💻', trend: selected.metrics.commitsTrend },
                { label: 'Net Lines', value: `+${selected.metrics.linesNet}`, icon: '📝' },
                { label: 'PRs Opened', value: selected.metrics.prsOpened, icon: '🔀' },
                { label: 'PRs Reviewed', value: selected.metrics.prsReviewed, icon: '👀' },
                { label: 'Issues Closed', value: selected.metrics.issuesClosed, icon: '✅' },
                { label: 'Avg Commit Size', value: `${selected.metrics.avgCommitSize} LOC`, icon: '📏' },
                { label: 'Deploy Freq', value: `${selected.metrics.deployFrequency}/wk`, icon: '🚀' },
                { label: 'Bug Fix %', value: `${(selected.metrics.bugFixRatio * 100).toFixed(0)}%`, icon: '🐛' },
                { label: 'Focus Time', value: `${selected.metrics.focusTime}h/day`, icon: '🎯' },
                { label: 'Work Hours', value: `${selected.weeklyHours[selected.weeklyHours.length - 1]}h/wk`, icon: '⏰' },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-lg bg-white/5 text-center">
                  <div className="text-sm mb-1">{m.icon}</div>
                  <div className="text-xs text-slate-400">{m.label}</div>
                  <div className="text-sm font-bold text-white">{m.value}</div>
                  {m.trend !== undefined && (
                    <div className={`text-xs ${m.trend > 0 ? 'text-green-400' : m.trend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      {m.trend > 0 ? '↑' : m.trend < 0 ? '↓' : '→'} {Math.abs(m.trend)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dimension Breakdown */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">🎯 Productivity Dimensions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selected.dimensions.map((dim) => (
                <div key={dim.label} className="p-3 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{dim.icon}</span>
                      <span className="text-sm font-semibold text-white">{dim.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold" style={{ color: dim.color }}>{dim.score}</span>
                      <span className={`text-xs ${dim.trend === 'up' ? 'text-green-400' : dim.trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
                        {dim.trend === 'up' ? '↑' : dim.trend === 'down' ? '↓' : '→'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 mb-2">
                    <div className="h-2 rounded-full" style={{ width: `${dim.score}%`, backgroundColor: dim.color }} />
                  </div>
                  <p className="text-xs text-slate-400">{dim.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">💡 Personalized Insights</h3>
            <div className="space-y-2">
              {selected.insights.map((insight, i) => (
                <div key={i} className={`p-3 rounded-lg flex items-start gap-3 ${
                  insight.startsWith('⚠️') ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/5'
                }`}>
                  <span className="text-lg">{insight.startsWith('⚠️') ? '⚠️' : '💡'}</span>
                  <p className="text-sm text-slate-300">{insight.replace('⚠️ ', '')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
