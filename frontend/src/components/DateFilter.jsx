import { shiftDate } from '../utils/metrics.js'

const PRESET_DAYS = [7, 14]

/**
 * 기간 필터. value: { from, to } ('' = 제한 없음)
 * '최근 N일'은 오늘이 아니라 데이터의 가장 최근 날짜(latest) 기준 (일자별 추이와 같은 기준)
 */
function DateFilter({ value, onChange, latest }) {
  const isAll = !value.from && !value.to

  function isPreset(days) {
    return latest && value.to === latest && value.from === shiftDate(latest, -(days - 1))
  }

  return (
    <div className="date-filter" role="group" aria-label="기간 필터">
      <button type="button" aria-pressed={isAll} onClick={() => onChange({ from: '', to: '' })}>
        전체 기간
      </button>
      {PRESET_DAYS.map((days) => (
        <button
          key={days}
          type="button"
          aria-pressed={Boolean(isPreset(days))}
          disabled={!latest}
          onClick={() => onChange({ from: shiftDate(latest, -(days - 1)), to: latest })}
        >
          최근 {days}일
        </button>
      ))}
      <span className="date-range">
        <input
          type="date"
          aria-label="시작 날짜"
          value={value.from}
          max={value.to || undefined}
          onChange={(event) => onChange({ ...value, from: event.target.value })}
        />
        <span aria-hidden="true">~</span>
        <input
          type="date"
          aria-label="끝 날짜"
          value={value.to}
          min={value.from || undefined}
          onChange={(event) => onChange({ ...value, to: event.target.value })}
        />
      </span>
    </div>
  )
}

export default DateFilter
