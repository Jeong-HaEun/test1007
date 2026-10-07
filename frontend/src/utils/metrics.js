// 광고 지표 계산은 이 파일에서만 한다. (CLAUDE.md "계산 지표" 참고)
// 계산 함수는 숫자 또는 null(분모가 0)을 돌려주고, format 함수가 null 을 '-' 로 바꾼다.

const numberFormat = new Intl.NumberFormat('ko-KR')

const NUMBER_FIELDS = ['cost', 'impressions', 'clicks', 'carts', 'conversions', 'revenue']

/** 분모가 0(또는 값 없음)이면 null */
export function divide(numerator, denominator) {
  if (!denominator) return null
  const result = numerator / denominator
  return Number.isFinite(result) ? result : null
}

/** 한 행(또는 합계)의 지표. 값은 비율/금액 숫자 또는 null */
export function calcMetrics(row) {
  return {
    ctr: divide(row.clicks, row.impressions),
    cpc: divide(row.cost, row.clicks),
    cpb: divide(row.cost, row.carts),
    cpa: divide(row.cost, row.conversions),
    roas: divide(row.revenue, row.cost),
  }
}

/** 여러 행의 숫자 합계. 전체 지표는 calcMetrics(sumReports(rows)) 로 구한다 (합계끼리 나눔) */
export function sumReports(rows) {
  const totals = Object.fromEntries(NUMBER_FIELDS.map((field) => [field, 0]))
  for (const row of rows) {
    for (const field of NUMBER_FIELDS) {
      totals[field] += Number(row[field]) || 0
    }
  }
  return totals
}

/** keyOf(row) 값이 같은 행끼리 숫자를 더한다. 반환: Map(key -> totals) */
function groupTotals(rows, keyOf) {
  const groups = new Map()
  for (const row of rows) {
    const key = keyOf(row)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }
  return new Map([...groups].map(([key, groupRows]) => [key, sumReports(groupRows)]))
}

/** '2026-10-07' 에서 days 만큼 뺀 날짜 (시간대 영향 없게 UTC 로 계산) */
function shiftDate(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * 일자별 추이: 데이터의 가장 최근 날짜 + 그 전 (days-1)일.
 * 반환: [{ date, totals }] 오래된 날짜부터. 데이터가 없는 날은 totals 가 null.
 */
export function dailyTrend(rows, days = 14) {
  if (rows.length === 0) return []
  const byDate = groupTotals(rows, (row) => row.reportDate)
  const latest = [...byDate.keys()].sort().at(-1)
  return Array.from({ length: days }, (_, index) => {
    const date = shiftDate(latest, index - (days - 1))
    return { date, totals: byDate.get(date) ?? null }
  })
}

/** 월 누적: [{ month: '2026-10', totals }] 최신 월부터 */
export function monthlyTotals(rows) {
  const byMonth = groupTotals(rows, (row) => row.reportDate.slice(0, 7))
  return [...byMonth]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, totals]) => ({ month, totals }))
}

/** 0.0235 -> '2.35%' (digits: 소수점 자리수) */
export function formatPercent(ratio, digits = 0) {
  if (ratio === null) return '-'
  return `${(ratio * 100).toFixed(digits)}%`
}

/** 1234.4 -> '1,234원' */
export function formatWon(value) {
  if (value === null) return '-'
  return `${numberFormat.format(Math.round(value))}원`
}

/** 50000 -> '50,000' (원본 숫자 표시용) */
export function formatNumber(value) {
  return numberFormat.format(value)
}

/** 화면 표시용 문자열. CTR 은 소수점 2자리, ROAS 는 정수 % */
export function formatMetrics(metrics) {
  return {
    ctr: formatPercent(metrics.ctr, 2),
    cpc: formatWon(metrics.cpc),
    cpb: formatWon(metrics.cpb),
    cpa: formatWon(metrics.cpa),
    roas: formatPercent(metrics.roas, 0),
  }
}
