/**
 * CodeOwnershipMatrix.tsx
 *
 * Code ownership analytics dashboard with:
 * - File/module ownership heatmap
 * - Contributor expertise map
 * - Ownership concentration analysis
 * - Historical ownership changes
 * - Risk assessment for single-owner files
 */

import { useState, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OwnerEntry {
  contributor: string
  avatar: string
  ownershipPct: number
  commits: number
  linesTouched: number
  lastActive: string
  expertiseLevel: 'expert' | 'familiar' | 'newcomer'
}

interface ModuleOwnership {
  module: string
  icon: string
  totalFiles: number
  totalCommits: number
  owners: OwnerEntry[]
  avgOwnershipConcentration: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

interface ContributionPattern {
  contributor: string
  avatar: string
  modulesContributed: number
  totalCommits: number
  avgCommitsPerModule: number
  primaryExpertise: string
  crossModulePct: number
  trend: 'growing' | 'stable' | 'declining'
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

function generateMockModuleOwnership(): ModuleOwnership[] {
  return [
    {
      module: 'Frontend Core', icon: '⚛️', totalFiles: 48, totalCommits: 342,
      avgOwnershipConcentration: 35,
      owners: [
        { contributor: 'Alice Chen', avatar: '👩‍💻', ownershipPct: 45, commits: 154, linesTouched: 8200, lastActive: '2 hours ago', expertiseLevel: 'expert' },
        { contributor: 'Bob Smith', avatar: '👨‍💻', ownershipPct: 28, commits: 96, linesTouched: 5100, lastActive: '1 day ago', expertiseLevel: 'familiar' },
        { contributor: 'Eva Martinez', avatar: '👩‍🎨', ownershipPct: 18, commits: 62, linesTouched: 3400, lastActive: '5 hours ago', expertiseLevel: 'familiar' },
        { contributor: 'Grace Kim', avatar: '👩‍🏫', ownershipPct: 9, commits: 30, linesTouched: 1200, lastActive: '3 days ago', expertiseLevel: 'newcomer' },
      ],
      riskLevel: 'low',
    },
    {
      module: 'Backend API', icon: '🔧', totalFiles: 62, totalCommits: 456,
      avgOwnershipConcentration: 42,
      owners: [
        { contributor: 'Bob Smith', avatar: '👨‍💻', ownershipPct: 52, commits: 237, linesTouched: 12400, lastActive: '1 day ago', expertiseLevel: 'expert' },
        { contributor: 'Carol White', avatar: '👩‍🔬', ownershipPct: 30, commits: 137, linesTouched: 7200, lastActive: '12 hours ago', expertiseLevel: 'expert' },
        { contributor: 'Frank Lee', avatar: '👨‍🔧', ownershipPct: 12, commits: 55, linesTouched: 2800, lastActive: '2 days ago', expertiseLevel: 'familiar' },
        { contributor: 'Eva Martinez', avatar: '👩‍🎨', ownershipPct: 6, commits: 27, linesTouched: 1100, lastActive: '1 week ago', expertiseLevel: 'newcomer' },
      ],
      riskLevel: 'medium',
    },
    {
      module: 'Database Layer', icon: '🗄️', totalFiles: 28, totalCommits: 189,
      avgOwnershipConcentration: 65,
      owners: [
        { contributor: 'Carol White', avatar: '👩‍🔬', ownershipPct: 72, commits: 136, linesTouched: 9800, lastActive: '12 hours ago', expertiseLevel: 'expert' },
        { contributor: 'David Brown', avatar: '🧑‍💻', ownershipPct: 22, commits: 42, linesTouched: 3100, lastActive: '3 days ago', expertiseLevel: 'familiar' },
        { contributor: 'Bob Smith', avatar: '👨‍💻', ownershipPct: 6, commits: 11, linesTouched: 600, lastActive: '2 weeks ago', expertiseLevel: 'newcomer' },
      ],
      riskLevel: 'high',
    },
    {
      module: 'DevOps / CI', icon: '🚀', totalFiles: 15, totalCommits: 98,
      avgOwnershipConcentration: 82,
      owners: [
        { contributor: 'David Brown', avatar: '🧑‍💻', ownershipPct: 85, commits: 83, linesTouched: 4200, lastActive: '3 days ago', expertiseLevel: 'expert' },
        { contributor: 'Alice Chen', avatar: '👩‍💻', ownershipPct: 10, commits: 10, linesTouched: 400, lastActive: '1 month ago', expertiseLevel: 'newcomer' },
        { contributor: 'Bob Smith', avatar: '👨‍💻', ownershipPct: 5, commits: 5, linesTouched: 200, lastActive: '2 months ago', expertiseLevel: 'newcomer' },
      ],
      riskLevel: 'critical',
    },
    {
      module: 'Auth & Security', icon: '🔐', totalFiles: 22, totalCommits: 167,
      avgOwnershipConcentration: 40,
      owners: [
        { contributor: 'Eva Martinez', avatar: '👩‍🎨', ownershipPct: 48, commits: 80, linesTouched: 5600, lastActive: '5 hours ago', expertiseLevel: 'expert' },
        { contributor: 'Grace Kim', avatar: '👩‍🏫', ownershipPct: 35, commits: 58, linesTouched: 4100, lastActive: '8 hours ago', expertiseLevel: 'expert' },
        { contributor: 'Alice Chen', avatar: '👩‍💻', ownershipPct: 17, commits: 29, linesTouched: 1800, lastActive: '2 days ago', expertiseLevel: 'familiar' },
      ],
      riskLevel: 'low',
    },
    {
      module: 'Testing', icon: '🧪', totalFiles: 54, totalCommits: 278,
      avgOwnershipConcentration: 32,
      owners: [
        { contributor: 'Grace Kim', avatar: '👩‍🏫', ownershipPct: 42, commits: 117, linesTouched: 7400, lastActive: '8 hours ago', expertiseLevel: 'expert' },
        { contributor: 'Alice Chen', avatar: '👩‍💻', ownershipPct: 25, commits: 70, linesTouched: 4200, lastActive: '2 hours ago', expertiseLevel: 'familiar' },
        { contributor: 'Carol White', avatar: '👩‍🔬', ownershipPct: 20, commits: 56, linesTouched: 3600, lastActive: '12 hours ago', expertiseLevel: 'familiar' },
        { contributor: 'Frank Lee', avatar: '👨‍🔧', ownershipPct: 13, commits: 35, linesTouched: 2100, lastActive: '2 days ago', expertiseLevel: 'newcomer' },
      ],
      riskLevel: 'low',
    },
    {
      module: 'Documentation', icon: '📝', totalFiles: 18, totalCommits: 89,
      avgOwnershipConcentration: 55,
      owners: [
        { contributor: 'Frank Lee', avatar: '👨‍🔧', ownershipPct: 62, commits: 55, linesTouched: 3800, lastActive: '2 days ago', expertiseLevel: 'expert' },
        { contributor: 'Grace Kim', avatar: '👩‍🏫', ownershipPct: 22, commits: 20, linesTouched: 1400, lastActive: '8 hours ago', expertiseLevel: 'familiar' },
        { contributor: 'Bob Smith', avatar: '👨‍💻', ownershipPct: 16, commits: 14, linesTouched: 900, lastActive: '1 week ago', expertiseLevel: 'newcomer' },
      ],
      riskLevel: 'medium',
    },
  ]
}

function generateMockContributionPatterns(): ContributionPattern[] {
  return [
    { contributor: 'Alice Chen', avatar: '👩‍💻', modulesContributed: 5, totalCommits: 342, avgCommitsPerModule: 68, primaryExpertise: 'Frontend Core', crossModulePct: 78, trend: 'growing' },
    { contributor: 'Bob Smith', avatar: '👨‍💻', modulesContributed: 4, totalCommits: 382, avgCommitsPerModule: 96, primaryExpertise: 'Backend API', crossModulePct: 62, trend: 'stable' },
    { contributor: 'Carol White', avatar: '👩‍🔬', modulesContributed: 3, totalCommits: 289, avgCommitsPerModule: 96, primaryExpertise: 'Database Layer', crossModulePct: 71, trend: 'growing' },
    { contributor: 'David Brown', avatar: '🧑‍💻', modulesContributed: 2, totalCommits: 130, avgCommitsPerModule: 65, primaryExpertise: 'DevOps / CI', crossModulePct: 35, trend: 'declining' },
    { contributor: 'Eva Martinez', avatar: '👩‍🎨', modulesContributed: 4, totalCommits: 217, avgCommitsPerModule: 54, primaryExpertise: 'Auth & Security', crossModulePct: 85, trend: 'growing' },
    { contributor: 'Frank Lee', avatar: '👨‍🔧', modulesContributed: 3, totalCommits: 161, avgCommitsPerModule: 54, primaryExpertise: 'Documentation', crossModulePct: 55, trend: 'stable' },
    { contributor: 'Grace Kim', avatar: '👩‍🏫', modulesContributed: 4, totalCommits: 295, avgCommitsPerModule: 74, primaryExpertise: 'Testing', crossModulePct: 92, trend: 'growing' },
  ]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRiskConfig(level: ModuleOwnership['riskLevel']) {
  const configs = {
    low: { label: 'Well Covered', color: '#22c55e', bg: 'bg-green-500/10 border-green-500/20' },
    medium: { label: 'Needs Backup', color: '#eab308', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    high: { label: 'Single Owner Risk', color: '#f97316', bg: 'bg-orange-500/10 border-orange-500/20' },
    critical: { label: 'Bus Factor = 1', color: '#ef4444', bg: 'bg-red-500/10 border-red-500/20' },
  }
  return configs[level]
}

function getExpertiseConfig(level: OwnerEntry['expertiseLevel']) {
  const configs = {
    expert: { label: 'Expert', color: '#22c55e' },
    familiar: { label: 'Familiar', color: '#eab308' },
    newcomer: { label: 'Newcomer', color: '#6b7280' },
  }
  return configs[level]
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CodeOwnershipMatrix() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'risk' | 'files' | 'commits'>('risk')

  const modules = useMemo(() => generateMockModuleOwnership(), [])
  const patterns = useMemo(() => generateMockContributionPatterns(), [])
  const selected = modules.find((m) => m.module === selectedModule)

  const sortedModules = useMemo(() => {
    const sorted = [...modules]
    if (sortBy === 'risk') {
      const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      sorted.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel])
    } else if (sortBy === 'files') {
      sorted.sort((a, b) => b.totalFiles - a.totalFiles)
    } else {
      sorted.sort((a, b) => b.totalCommits - a.totalCommits)
    }
    return sorted
  }, [modules, sortBy])

  // Summary stats
  const totalFiles = modules.reduce((sum, m) => sum + m.totalFiles, 0)
  const totalCommits = modules.reduce((sum, m) => sum + m.totalCommits, 0)
  const criticalModules = modules.filter((m) => m.riskLevel === 'critical').length
  const highRiskModules = modules.filter((m) => m.riskLevel === 'high').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-3xl">🗺️</span> Code Ownership Matrix
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Who owns what files, contribution patterns, and ownership risk analysis
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase">Total Files</div>
          <div className="text-2xl font-bold text-white">{totalFiles}</div>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase">Total Commits</div>
          <div className="text-2xl font-bold text-white">{totalCommits.toLocaleString()}</div>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase">Critical Modules</div>
          <div className="text-2xl font-bold text-red-400">{criticalModules}</div>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase">High Risk</div>
          <div className="text-2xl font-bold text-orange-400">{highRiskModules}</div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-2">
        {[
          { id: 'risk' as const, label: '⚠️ Risk Level' },
          { id: 'files' as const, label: '📁 Files' },
          { id: 'commits' as const, label: '💻 Commits' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setSortBy(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortBy === s.id
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Module Ownership Cards */}
      <div className="space-y-3">
        {sortedModules.map((mod) => {
          const riskConfig = getRiskConfig(mod.riskLevel)
          const isSelected = selectedModule === mod.module
          return (
            <button
              key={mod.module}
              onClick={() => setSelectedModule(isSelected ? null : mod.module)}
              className={`w-full text-left glass-panel rounded-xl p-4 transition-all hover:border-purple-500/30 ${
                isSelected ? 'border-purple-500/50 bg-purple-500/5' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{mod.icon}</span>
                  <span className="font-semibold text-white">{mod.module}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${riskConfig.bg}`}>{riskConfig.label}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{mod.totalFiles} files</span>
                  <span>{mod.totalCommits} commits</span>
                  <span>{mod.owners.length} contributors</span>
                </div>
              </div>

              {/* Ownership bar */}
              <div className="flex h-3 rounded-full overflow-hidden mb-2">
                {mod.owners.map((owner) => (
                  <div
                    key={owner.contributor}
                    className="h-full transition-all hover:opacity-80"
                    style={{
                      width: `${owner.ownershipPct}%`,
                      backgroundColor: owner.expertiseLevel === 'expert' ? '#8b5cf6' : owner.expertiseLevel === 'familiar' ? '#6366f1' : '#4f46e5',
                    }}
                    title={`${owner.contributor}: ${owner.ownershipPct}%`}
                  />
                ))}
              </div>

              {/* Owner chips */}
              <div className="flex flex-wrap gap-1">
                {mod.owners.map((owner) => {
                  const exp = getExpertiseConfig(owner.expertiseLevel)
                  return (
                    <span key={owner.contributor} className="text-xs px-2 py-0.5 rounded-full bg-white/5 flex items-center gap-1">
                      <span>{owner.avatar}</span>
                      <span className="text-slate-300">{owner.contributor.split(' ')[0]}</span>
                      <span className="font-semibold" style={{ color: exp.color }}>{owner.ownershipPct}%</span>
                    </span>
                  )
                })}
              </div>

              {/* Expanded Detail */}
              {isSelected && selected && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  {/* Detailed owner table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-400 text-xs uppercase">
                          <th className="text-left pb-2">Contributor</th>
                          <th className="text-right pb-2">Ownership</th>
                          <th className="text-right pb-2">Commits</th>
                          <th className="text-right pb-2">Lines Touched</th>
                          <th className="text-right pb-2">Expertise</th>
                          <th className="text-right pb-2">Last Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.owners.map((owner) => {
                          const exp = getExpertiseConfig(owner.expertiseLevel)
                          return (
                            <tr key={owner.contributor} className="border-t border-white/5">
                              <td className="py-2 flex items-center gap-2">
                                <span>{owner.avatar}</span>
                                <span className="text-white">{owner.contributor}</span>
                              </td>
                              <td className="text-right py-2 font-bold text-purple-400">{owner.ownershipPct}%</td>
                              <td className="text-right py-2 text-slate-300">{owner.commits}</td>
                              <td className="text-right py-2 text-slate-300">{owner.linesTouched.toLocaleString()}</td>
                              <td className="text-right py-2" style={{ color: exp.color }}>{exp.label}</td>
                              <td className="text-right py-2 text-slate-400">{owner.lastActive}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Concentration metric */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Ownership Concentration:</span>
                    <div className="flex-1 bg-white/5 rounded-full h-2 max-w-xs">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${selected.avgOwnershipConcentration}%`,
                          backgroundColor: selected.avgOwnershipConcentration > 70 ? '#ef4444' : selected.avgOwnershipConcentration > 50 ? '#f97316' : '#22c55e',
                        }}
                      />
                    </div>
                    <span className="text-white font-semibold">{selected.avgOwnershipConcentration}%</span>
                    <span className="text-slate-500">
                      ({selected.avgOwnershipConcentration > 70 ? 'Highly concentrated' : selected.avgOwnershipConcentration > 50 ? 'Moderately concentrated' : 'Well distributed'})
                    </span>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Contributor Patterns */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">👤 Contributor Patterns</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-xs uppercase">
                <th className="text-left pb-3">Contributor</th>
                <th className="text-right pb-3">Modules</th>
                <th className="text-right pb-3">Total Commits</th>
                <th className="text-right pb-3">Avg/Module</th>
                <th className="text-left pb-3">Primary Expertise</th>
                <th className="text-right pb-3">Cross-Module %</th>
                <th className="text-right pb-3">Trend</th>
              </tr>
            </thead>
            <tbody>
              {patterns
                .sort((a, b) => b.totalCommits - a.totalCommits)
                .map((p) => {
                  const trendConfig = {
                    growing: { icon: '📈', color: '#22c55e' },
                    stable: { icon: '➡️', color: '#eab308' },
                    declining: { icon: '📉', color: '#ef4444' },
                  }
                  const tc = trendConfig[p.trend]
                  return (
                    <tr key={p.contributor} className="border-t border-white/5 hover:bg-white/5">
                      <td className="py-3 flex items-center gap-2">
                        <span>{p.avatar}</span>
                        <span className="text-white font-medium">{p.contributor}</span>
                      </td>
                      <td className="text-right py-3 text-slate-300">{p.modulesContributed}</td>
                      <td className="text-right py-3 text-slate-300">{p.totalCommits}</td>
                      <td className="text-right py-3 text-slate-300">{p.avgCommitsPerModule}</td>
                      <td className="py-3 text-slate-300">{p.primaryExpertise}</td>
                      <td className="text-right py-3">
                        <span className={`font-semibold ${p.crossModulePct >= 70 ? 'text-green-400' : p.crossModulePct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {p.crossModulePct}%
                        </span>
                      </td>
                      <td className="text-right py-3" style={{ color: tc.color }}>
                        {tc.icon} {p.trend}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Recommendations */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">💡 Ownership Risk Recommendations</h3>
        <div className="space-y-2">
          {[
            { priority: '🔴', title: 'DevOps/CI: Critical bus factor (1)', desc: 'David Brown is the sole contributor (85%). Cross-train at least one more developer immediately.', module: 'DevOps / CI' },
            { priority: '🟠', title: 'Database Layer: High concentration', desc: 'Carol White owns 72%. Schedule knowledge transfer sessions with David Brown.', module: 'Database Layer' },
            { priority: '🟡', title: 'Backend API: Moderate concentration', desc: 'Bob Smith at 52% — consider having Carol take more ownership of API routes.', module: 'Backend API' },
            { priority: '🔵', title: 'Documentation: Understaffed', desc: 'Only 3 contributors for 18 docs files. Encourage more team members to contribute.', module: 'Documentation' },
          ].map((rec, i) => (
            <div key={i} className="p-3 rounded-lg bg-white/5 flex items-start gap-3">
              <span className="text-lg">{rec.priority}</span>
              <div>
                <div className="text-sm font-semibold text-white">{rec.title}</div>
                <p className="text-xs text-slate-400">{rec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
