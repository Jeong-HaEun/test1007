import { useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router'
import { fetchReports } from './api/reports.js'
import CsvUpload from './components/CsvUpload.jsx'
import CampaignPage from './pages/CampaignPage.jsx'
import OverviewPage from './pages/OverviewPage.jsx'
import './App.css'

/** 공통 틀: 제목·CSV 업로드·메뉴 + 데이터 불러오기. 페이지는 받은 reports 로 그리기만 한다 */
function App() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function loadReports() {
    return fetchReports()
      .then((data) => {
        setReports(data)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadReports()
  }, [])

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1 className="brand">
            <img src="/favicon.png" alt="" width="40" height="40" />
            Adporter
          </h1>
          <p>광고 성과 보고서 · 매체별 CTR · CPC · CPB(Cost Per Basket) · CPA · ROAS</p>
        </div>
        <CsvUpload onUploaded={loadReports} />
      </header>

      <nav className="page-nav" aria-label="페이지">
        <NavLink to="/" end>요약</NavLink>
        <NavLink to="/campaigns">캠페인 · 광고그룹</NavLink>
      </nav>

      {loading && <p className="glass status">불러오는 중…</p>}
      {error && <p className="glass status">⚠️ {error} — 백엔드가 켜져 있는지 확인하세요.</p>}
      {!loading && !error && (
        <Routes>
          <Route path="/" element={<OverviewPage reports={reports} />} />
          <Route path="/campaigns" element={<CampaignPage reports={reports} onChanged={loadReports} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </main>
  )
}

export default App
