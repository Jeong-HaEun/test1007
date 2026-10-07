import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  calcMetrics, dailyTrend, formatMetrics, formatNumber, monthlyTotals, sumReports,
} from './metrics.js'

const sample = {
  cost: 100000,
  impressions: 50000,
  clicks: 1200,
  carts: 80,
  conversions: 30,
  revenue: 450000,
}

test('한 행의 지표를 표시 형식으로 계산한다', () => {
  assert.deepEqual(formatMetrics(calcMetrics(sample)), {
    ctr: '2.40%',
    cpc: '83원',
    cpb: '1,250원',
    cpa: '3,333원',
    roas: '450%',
  })
})

test('분모가 0이면 - 를 표시한다', () => {
  const zero = { cost: 0, impressions: 0, clicks: 0, carts: 0, conversions: 0, revenue: 1000 }
  assert.deepEqual(formatMetrics(calcMetrics(zero)), {
    ctr: '-',
    cpc: '-',
    cpb: '-',
    cpa: '-',
    roas: '-',
  })
})

test('분모만 0인 지표만 - 가 된다 (장바구니 0 -> CPB 만 -)', () => {
  const result = formatMetrics(calcMetrics({ ...sample, carts: 0 }))
  assert.equal(result.cpb, '-')
  assert.equal(result.cpa, '3,333원')
})

test('전체 ROAS 는 행별 평균이 아니라 합계끼리 나눈다', () => {
  const rows = [
    { ...sample, cost: 100000, revenue: 500000 }, // 행 ROAS 500%
    { ...sample, cost: 300000, revenue: 300000 }, // 행 ROAS 100%
  ]
  // 평균이면 300%, 합계끼리면 800,000 / 400,000 = 200%
  assert.equal(formatMetrics(calcMetrics(sumReports(rows))).roas, '200%')
})

test('빈 목록의 합계는 0 이고 지표는 - 이다', () => {
  const totals = sumReports([])
  assert.equal(totals.cost, 0)
  assert.equal(formatMetrics(calcMetrics(totals)).roas, '-')
})

test('원본 숫자는 천 단위 쉼표로 표시한다', () => {
  assert.equal(formatNumber(1234567), '1,234,567')
})

const day = (reportDate, cost, conversions, revenue) =>
  ({ reportDate, cost, impressions: 0, clicks: 0, carts: 0, conversions, revenue })

test('일자별 추이는 가장 최근 날짜 기준 14일이고, 데이터 없는 날은 null 이다', () => {
  const rows = [day('2026-09-01', 1, 1, 1), day('2026-10-01', 100, 1, 300), day('2026-10-20', 200, 4, 400)]
  const trend = dailyTrend(rows)
  assert.equal(trend.length, 14)
  assert.equal(trend[0].date, '2026-10-07')
  assert.equal(trend[13].date, '2026-10-20')
  assert.equal(trend[0].totals, null) // 10/07 데이터 없음
  assert.ok(trend.every(({ date }) => date >= '2026-10-07')) // 14일보다 오래된 데이터는 제외
})

test('일자별 지표는 같은 날 행을 더한 뒤 나눈다', () => {
  const rows = [day('2026-10-20', 100, 1, 500), day('2026-10-20', 300, 3, 300)]
  const { totals } = dailyTrend(rows).at(-1)
  const metrics = formatMetrics(calcMetrics(totals))
  assert.equal(metrics.cpa, '100원') // 400 / 4
  assert.equal(metrics.roas, '200%') // 800 / 400
})

test('월 경계를 넘어도 날짜가 이어진다', () => {
  const trend = dailyTrend([day('2026-03-05', 1, 1, 1)])
  assert.equal(trend[0].date, '2026-02-20')
})

test('월 누적은 월별로 더하고 최신 월이 먼저 온다', () => {
  const rows = [day('2026-09-30', 100, 1, 100), day('2026-10-01', 200, 1, 600), day('2026-10-15', 300, 1, 400)]
  const months = monthlyTotals(rows)
  assert.deepEqual(months.map(({ month }) => month), ['2026-10', '2026-09'])
  assert.equal(months[0].totals.cost, 500)
  assert.equal(months[0].totals.revenue, 1000)
})

test('데이터가 없으면 추이와 월 누적 모두 빈 목록이다', () => {
  assert.deepEqual(dailyTrend([]), [])
  assert.deepEqual(monthlyTotals([]), [])
})
