import { useEffect, useState } from 'react'
import { fetchReports } from './api/reports.js'
import './App.css'

function App() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main>
      <h1>광고 성과 보고서</h1>
      {loading && <p>불러오는 중…</p>}
      {error && <p>⚠️ {error} — 백엔드가 켜져 있는지 확인하세요.</p>}
      {!loading && !error && (
        <>
          <p>데이터 {reports.length}개</p>
          {/* 3단계: 연결 확인용으로 원본 그대로 보여준다. 4단계에서 표로 바꾼다. */}
          <pre>{JSON.stringify(reports, null, 2)}</pre>
        </>
      )}
    </main>
  )
}

export default App
