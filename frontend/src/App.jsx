import { useEffect, useState } from 'react'
import { createReport, deleteReport, fetchReports, updateReport } from './api/reports.js'
import CsvUpload from './components/CsvUpload.jsx'
import DailyTrend from './components/DailyTrend.jsx'
import DateFilter from './components/DateFilter.jsx'
import MediaFilter, { MEDIA_ALL } from './components/MediaFilter.jsx'
import MonthlySummary from './components/MonthlySummary.jsx'
import ReportForm from './components/ReportForm.jsx'
import ReportTable from './components/ReportTable.jsx'
import SummaryCards from './components/SummaryCards.jsx'
import { filterByDateRange, latestDate } from './utils/metrics.js'
import './App.css'

const NEW_REPORT = 'new'

function App() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [media, setMedia] = useState(MEDIA_ALL)
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [editing, setEditing] = useState(null) // null | NEW_REPORT | 수정할 행
  const [actionError, setActionError] = useState(null)

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

  async function handleSave(values) {
    if (editing === NEW_REPORT) await createReport(values)
    else await updateReport(editing.id, values)
    setEditing(null)
    await loadReports()
  }

  async function handleDelete(id) {
    setActionError(null)
    try {
      await deleteReport(id)
      if (editing?.id === id) setEditing(null)
      await loadReports()
    } catch (err) {
      setActionError(`삭제 실패: ${err.message}`)
    }
  }

  // 필터는 화면에서 처리한다.
  // 매체: 전체 화면에 적용 / 기간: 상단(합계 카드·성과 표)에만 적용
  const mediaReports =
    media === MEDIA_ALL ? reports : reports.filter((report) => report.media === media)
  const topReports = filterByDateRange(mediaReports, dateRange.from, dateRange.to)

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>광고 성과 보고서</h1>
          <p>매체별 광고 성과와 CTR · CPC · CPB · CPA · ROAS</p>
        </div>
        <CsvUpload onUploaded={loadReports} />
      </header>
      {loading && <p className="glass status">불러오는 중…</p>}
      {error && <p className="glass status">⚠️ {error} — 백엔드가 켜져 있는지 확인하세요.</p>}
      {!loading && !error && (
        <>
          <div className="toolbar">
            <MediaFilter value={media} onChange={setMedia} />
            <DateFilter value={dateRange} onChange={setDateRange} latest={latestDate(reports)} />
            <button
              type="button"
              className="button-primary toolbar-add"
              onClick={() => setEditing(NEW_REPORT)}
            >
              + 직접 추가
            </button>
          </div>
          <SummaryCards reports={topReports} />
          {editing && (
            <ReportForm
              key={editing === NEW_REPORT ? NEW_REPORT : editing.id}
              report={editing === NEW_REPORT ? null : editing}
              onSubmit={handleSave}
              onCancel={() => setEditing(null)}
            />
          )}
          {actionError && <p className="glass status form-error">⚠️ {actionError}</p>}
          <ReportTable reports={topReports} onEdit={setEditing} onDelete={handleDelete} />
          <DailyTrend reports={mediaReports} />
          <MonthlySummary reports={mediaReports} />
        </>
      )}
    </main>
  )
}

export default App
