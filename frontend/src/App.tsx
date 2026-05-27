import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AnalyzePage from './pages/AnalyzePage'
import DashboardPage from './pages/DashboardPage'
import CommitDetailPage from './pages/CommitDetailPage'
import DemoPage from './pages/DemoPage'
import NotFoundPage from './pages/NotFoundPage'
import AmbientBackground from './components/AmbientBackground'

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen text-[var(--color-primary)] selection:bg-purple-500/30 selection:text-white">
        <AmbientBackground />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/dashboard/:repoSlug" element={<DashboardPage />} />
          <Route path="/dashboard/:repoSlug/commit/:sha" element={<CommitDetailPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
