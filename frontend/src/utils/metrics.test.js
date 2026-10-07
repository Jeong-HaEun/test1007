import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calcMetrics, formatMetrics, formatNumber, sumReports } from './metrics.js'

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
