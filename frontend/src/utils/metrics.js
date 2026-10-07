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
