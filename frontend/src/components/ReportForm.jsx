import { useEffect, useRef, useState } from 'react'

const TEXT_FIELDS = [
  { field: 'campaignName', label: '캠페인' },
  { field: 'adGroupName', label: '광고그룹' },
  { field: 'creativeName', label: '소재' },
]
const NUMBER_FIELDS = [
  { field: 'cost', label: '광고비 (원)' },
  { field: 'impressions', label: '노출' },
  { field: 'clicks', label: '클릭' },
  { field: 'carts', label: '장바구니' },
  { field: 'conversions', label: '전환' },
  { field: 'revenue', label: '매출 (원)' },
]

const EMPTY = {
  reportDate: '', media: 'NAVER', campaignName: '', adGroupName: '', creativeName: '',
  cost: '', impressions: '', clicks: '', carts: '', conversions: '', revenue: '',
}

/**
 * 한 줄 추가·수정 입력 칸. report 가 있으면 수정, 없으면 추가.
 * onSubmit(값) 은 Promise 를 돌려준다. 실패하면 메시지를 보여주고 입력값은 유지한다.
 */
function ReportForm({ report, onSubmit, onCancel }) {
  const [values, setValues] = useState(report ? { ...EMPTY, ...report } : EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const formRef = useRef(null)

  // 표 아래쪽 행을 수정해도 입력 칸이 보이도록 화면을 옮긴다
  useEffect(() => {
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  function change(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    const payload = { ...values }
    for (const { field } of NUMBER_FIELDS) payload[field] = Number(values[field])
    try {
      await onSubmit(payload)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form ref={formRef} className="glass report-form" onSubmit={handleSubmit}>
      <h2>{report ? '성과 데이터 수정' : '성과 데이터 직접 추가'}</h2>

      <div className="form-grid">
        <label>
          날짜
          <input
            type="date"
            required
            value={values.reportDate}
            onChange={(event) => change('reportDate', event.target.value)}
          />
        </label>
        <label>
          매체
          <select value={values.media} onChange={(event) => change('media', event.target.value)}>
            <option value="NAVER">NAVER</option>
            <option value="META">META</option>
            <option value="GOOGLE">GOOGLE</option>
          </select>
        </label>
        {TEXT_FIELDS.map(({ field, label }) => (
          <label key={field}>
            {label}
            <input
              type="text"
              required
              maxLength={100}
              value={values[field]}
              onChange={(event) => change(field, event.target.value)}
            />
          </label>
        ))}
        {NUMBER_FIELDS.map(({ field, label }) => (
          <label key={field}>
            {label}
            <input
              type="number"
              required
              min={0}
              step={1}
              inputMode="numeric"
              value={values[field]}
              onChange={(event) => change(field, event.target.value)}
            />
          </label>
        ))}
      </div>

      {error && <p className="form-error">⚠️ 저장 실패: {error}</p>}

      <div className="form-actions">
        <button type="button" className="button-secondary" onClick={onCancel} disabled={saving}>
          취소
        </button>
        <button type="submit" className="button-primary" disabled={saving}>
          {saving ? '저장 중…' : report ? '수정 저장' : '추가'}
        </button>
      </div>
    </form>
  )
}

export default ReportForm
