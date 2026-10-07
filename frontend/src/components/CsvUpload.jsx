import { useRef, useState } from 'react'
import { bulkUpsertReports } from '../api/reports.js'
import { buildTemplateCsv, decodeCsv, parseReportCsv } from '../utils/csv.js'

const MAX_ERRORS_SHOWN = 10

/** CSV 업로드 + 양식 내려받기. 업로드가 끝나면 onUploaded() 로 목록을 다시 불러오게 한다 */
function CsvUpload({ onUploaded }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'success' | 'error', text }
  const [errors, setErrors] = useState([])

  async function handleFile(event) {
    const file = event.target.files[0]
    event.target.value = '' // 같은 파일을 다시 골라도 동작하게
    if (!file) return

    setBusy(true)
    setMessage(null)
    setErrors([])
    try {
      const text = decodeCsv(await file.arrayBuffer())
      const { rows, errors: parseErrors } = parseReportCsv(text)
      if (parseErrors.length > 0) {
        setErrors(parseErrors)
        setMessage({ type: 'error', text: `${file.name}: 문제가 있어 아무것도 저장하지 않았어요.` })
        return
      }
      const result = await bulkUpsertReports(rows)
      setMessage({
        type: 'success',
        text: `${file.name}: 새로 추가 ${result.created}건, 덮어쓰기 ${result.updated}건`,
      })
      onUploaded()
    } catch (err) {
      setMessage({ type: 'error', text: `업로드 실패: ${err.message}` })
    } finally {
      setBusy(false)
    }
  }

  function downloadTemplate() {
    const blob = new Blob([buildTemplateCsv()], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '광고성과_양식.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="csv-upload">
      <div className="csv-actions">
        <button type="button" className="button-secondary" onClick={downloadTemplate}>
          양식 내려받기
        </button>
        <button
          type="button"
          className="button-primary"
          disabled={busy}
          onClick={() => inputRef.current.click()}
        >
          {busy ? '업로드 중…' : 'CSV 업로드'}
        </button>
        <input ref={inputRef} type="file" accept=".csv,text/csv" hidden onChange={handleFile} />
      </div>

      {message && (
        <div className={`glass csv-message ${message.type}`} role="status">
          <p>{message.text}</p>
          {errors.length > 0 && (
            <ul>
              {errors.slice(0, MAX_ERRORS_SHOWN).map((error) => <li key={error}>{error}</li>)}
              {errors.length > MAX_ERRORS_SHOWN && <li>외 {errors.length - MAX_ERRORS_SHOWN}건</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default CsvUpload
