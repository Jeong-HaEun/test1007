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

/** '2026-10-07' 에서 days 만큼 옮긴 날짜 (시간대 영향 없게 UTC 로 계산) */
export function shiftDate(isoDate, days) {
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

/** 데이터에서 가장 최근 날짜. 없으면 null */
export function latestDate(rows) {
  return rows.reduce((latest, row) => (latest && latest > row.reportDate ? latest : row.reportDate), null)
}

/** 매체 필터의 '전체' 값 */
export const MEDIA_ALL = 'ALL'

/** 선택한 매체의 행만. MEDIA_ALL 이면 전체 */
export function filterByMedia(rows, media) {
  return media === MEDIA_ALL ? rows : rows.filter((row) => row.media === media)
}

/** from ~ to (둘 다 포함) 사이의 행. 빈 값('')은 제한 없음 */
export function filterByDateRange(rows, from, to) {
  return rows.filter((row) => (!from || row.reportDate >= from) && (!to || row.reportDate <= to))
}

/**
 * 캠페인 → 광고그룹 성과. 캠페인은 매체+캠페인명으로 구분한다 (매체가 다르면 다른 캠페인).
 * 반환: [{ key, media, campaignName, totals, adGroups: [{ key, adGroupName, totals }] }] 광고비 큰 순
 */
export function campaignBreakdown(rows) {
  const byCost = (a, b) => b.totals.cost - a.totals.cost
  const campaigns = new Map()
  for (const row of rows) {
    const key = `${row.media}|${row.campaignName}`
    if (!campaigns.has(key)) {
      campaigns.set(key, { key, media: row.media, campaignName: row.campaignName, rows: [] })
    }
    campaigns.get(key).rows.push(row)
  }
  return [...campaigns.values()]
    .map(({ rows: campaignRows, ...campaign }) => ({
      ...campaign,
      totals: sumReports(campaignRows),
      adGroups: [...groupTotals(campaignRows, (row) => row.adGroupName)]
        .map(([adGroupName, totals]) => ({ key: `${campaign.key}|${adGroupName}`, adGroupName, totals }))
        .sort(byCost),
    }))
    .sort(byCost)
}

/** '2026-10' 에서 months 만큼 옮긴 월 */
export function shiftMonth(yearMonth, months) {
  const [year, month] = yearMonth.split('-').map(Number)
  const index = year * 12 + (month - 1) + months
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`
}

/**
 * 월 누적 추이: 데이터의 가장 최근 월 + 그 전 (months-1)개월.
 * 반환: [{ month, totals, previous }] 오래된 월부터.
 * 데이터가 없는 달은 totals 가 null. previous 는 전월 totals (전월 대비 계산용, 범위 밖 전월도 포함).
 */
export function monthlyTrend(rows, months = 3) {
  if (rows.length === 0) return []
  const byMonth = groupTotals(rows, (row) => row.reportDate.slice(0, 7))
  const latest = [...byMonth.keys()].sort().at(-1)
  return Array.from({ length: months }, (_, index) => {
    const month = shiftMonth(latest, index - (months - 1))
    return {
      month,
      totals: byMonth.get(month) ?? null,
      previous: byMonth.get(shiftMonth(month, -1)) ?? null,
    }
  })
}

/** 전월 대비 증감률 (CPA 등 금액): 10000 -> 8800 = -0.12. 계산 불가면 null */
export function changeRate(current, previous) {
  if (current === null || previous === null || previous === 0) return null
  return (current - previous) / previous
}

/** 부호를 화살표로: 0.12 -> '▲ 12%', -0.08 -> '▼ 8%'. unit: '%' 또는 '%p' */
export function formatChange(value, unit = '%') {
  if (value === null) return '-'
  const percent = Math.round(value * 100)
  if (percent === 0) return `0${unit}`
  return `${percent > 0 ? '▲' : '▼'} ${Math.abs(percent)}${unit}`
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
