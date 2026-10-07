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
  const [media, setMedia] = useState(MEDIA_ALL) // 상단 요약용
  const [rawMedia, setRawMedia] = useState(MEDIA_ALL) // 로우 데이터용 (상단과 따로)
  const [dateRange, setDateRange] = useState({ from: '', to: '' }) // 로우 데이터용
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
  // 상단(합계 카드·일자별 추이·월 누적): 상단 매체 필터만
  // 로우 데이터: 로우 데이터용 매체 필터 + 기간 필터 (상단과 따로 동작)
  const byMedia = (value) =>
    value === MEDIA_ALL ? reports : reports.filter((report) => report.media === value)
  const summaryReports = byMedia(media)
  const rawReports = filterByDateRange(byMedia(rawMedia), dateRange.from, dateRange.to)

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
          <MediaFilter value={media} onChange={setMedia} label="요약 매체 필터" />
          <SummaryCards reports={summaryReports} />
          <DailyTrend reports={summaryReports} />
          <MonthlySummary reports={summaryReports} />

          <section className="section raw-section">
            <h2>
              로우 데이터
              <span className="section-sub">{rawReports.length}줄 · 수정·삭제 가능</span>
            </h2>
            <div className="toolbar">
              <MediaFilter value={rawMedia} onChange={setRawMedia} label="로우 데이터 매체 필터" />
              <DateFilter value={dateRange} onChange={setDateRange} latest={latestDate(reports)} />
              <button
                type="button"
                className="button-primary toolbar-add"
                onClick={() => setEditing(NEW_REPORT)}
              >
                + 직접 추가
              </button>
            </div>
            {editing && (
              <ReportForm
                key={editing === NEW_REPORT ? NEW_REPORT : editing.id}
                report={editing === NEW_REPORT ? null : editing}
                onSubmit={handleSave}
                onCancel={() => setEditing(null)}
              />
            )}
            {actionError && <p className="glass status form-error">⚠️ {actionError}</p>}
            <ReportTable reports={rawReports} onEdit={setEditing} onDelete={handleDelete} />
          </section>
        </>
      )}
    </main>
  )
}

export default App
