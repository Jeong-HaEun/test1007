import { useState } from 'react'
import { createReport, deleteReport, updateReport } from '../api/reports.js'
import CampaignTable from '../components/CampaignTable.jsx'
import DateFilter from '../components/DateFilter.jsx'
import MediaFilter from '../components/MediaFilter.jsx'
import ReportForm from '../components/ReportForm.jsx'
import ReportTable from '../components/ReportTable.jsx'
import { MEDIA_ALL, filterByDateRange, filterByMedia, latestDate } from '../utils/metrics.js'

const NEW_REPORT = 'new'

/**
 * 캠페인·광고그룹 페이지. 페이지 위 매체·기간 필터가 캠페인 표와 로우 데이터 모두에 적용된다.
 * onChanged(): 추가·수정·삭제 후 목록을 다시 불러온다.
 */
function CampaignPage({ reports, onChanged }) {
  const [media, setMedia] = useState(MEDIA_ALL)
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [editing, setEditing] = useState(null) // null | NEW_REPORT | 수정할 행
  const [actionError, setActionError] = useState(null)

  const visible = filterByDateRange(filterByMedia(reports, media), dateRange.from, dateRange.to)

  async function handleSave(values) {
    if (editing === NEW_REPORT) await createReport(values)
    else await updateReport(editing.id, values)
    setEditing(null)
    await onChanged()
  }

  async function handleDelete(id) {
    setActionError(null)
    try {
      await deleteReport(id)
      if (editing?.id === id) setEditing(null)
      await onChanged()
    } catch (err) {
      setActionError(`삭제 실패: ${err.message}`)
    }
  }

  return (
    <>
      <div className="toolbar">
        <MediaFilter value={media} onChange={setMedia} />
        <DateFilter value={dateRange} onChange={setDateRange} latest={latestDate(reports)} />
      </div>

      <section className="section">
        <h2>
          캠페인 · 광고그룹 성과
          <span className="section-sub">캠페인을 누르면 광고그룹이 펼쳐져요 · 광고비 큰 순</span>
        </h2>
        <CampaignTable reports={visible} />
      </section>

      <section className="section raw-section">
        <h2>
          로우 데이터
          <span className="section-sub">{visible.length}줄 · 수정·삭제 가능</span>
          <button
            type="button"
            className="button-primary section-action"
            onClick={() => setEditing(NEW_REPORT)}
          >
            + 직접 추가
          </button>
        </h2>
        {editing && (
          <ReportForm
            key={editing === NEW_REPORT ? NEW_REPORT : editing.id}
            report={editing === NEW_REPORT ? null : editing}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        )}
        {actionError && <p className="glass status form-error">⚠️ {actionError}</p>}
        <ReportTable reports={visible} onEdit={setEditing} onDelete={handleDelete} />
      </section>
    </>
  )
}

export default CampaignPage
