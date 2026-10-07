import { useEffect, useState } from 'react'
import { fetchReports } from './api/reports.js'
import MediaFilter, { MEDIA_ALL } from './components/MediaFilter.jsx'
import ReportTable from './components/ReportTable.jsx'
import './App.css'

function App() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [media, setMedia] = useState(MEDIA_ALL)

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // 필터는 화면에서 처리한다. (5단계 합계 카드도 이 목록 기준)
  const visibleReports =
    media === MEDIA_ALL ? reports : reports.filter((report) => report.media === media)

  return (
    <main className="app">
      <header className="app-header">
        <h1>광고 성과 보고서</h1>
        <p>매체별 광고 성과와 CTR · CPC · CPB · CPA · ROAS</p>
      </header>
      {loading && <p className="glass status">불러오는 중…</p>}
      {error && <p className="glass status">⚠️ {error} — 백엔드가 켜져 있는지 확인하세요.</p>}
      {!loading && !error && (
        <>
          <MediaFilter value={media} onChange={setMedia} />
          <ReportTable reports={visibleReports} />
        </>
      )}
    </main>
  )
}

export default App
