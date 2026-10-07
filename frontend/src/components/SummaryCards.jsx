import {
  calcMetrics, changeRate, formatChange, formatMetrics, formatWon, periodComparison, sumReports,
} from '../utils/metrics.js'

const WEEK = 7

/** '2026-10-07' -> '10/7' */
function shortDate(isoDate) {
  const [, month, day] = isoDate.split('-')
  return `${Number(month)}/${Number(day)}`
}

/**
 * 상단 합계 카드. 큰 숫자는 전체 기간 합계, 작은 줄은 최근 7일 값 + 전주 대비.
 * 전체 지표는 합계끼리 나눈다 (행별 평균 아님)
 */
function SummaryCards({ reports }) {
  const totals = sumReports(reports)
  const metrics = formatMetrics(calcMetrics(totals))

  const week = periodComparison(reports, WEEK)
  const now = week ? calcMetrics(week.current) : null
  const before = week ? calcMetrics(week.previous) : null
  const nowShown = now ? formatMetrics(now) : null

  const cards = [
    {
      label: '총 광고비',
      value: formatWon(totals.cost),
      recent: week && formatWon(week.current.cost),
      change: week && formatChange(changeRate(week.current.cost, week.previous.cost)),
    },
    {
      label: '총 매출',
      value: formatWon(totals.revenue),
      recent: week && formatWon(week.current.revenue),
      change: week && formatChange(changeRate(week.current.revenue, week.previous.revenue)),
    },
    {
      label: '전체 ROAS',
      hint: '매출 ÷ 광고비',
      value: metrics.roas,
      accent: true,
      recent: nowShown?.roas,
      // ROAS 는 이미 % 라서 차이(%p)로 보여준다
      change: week && formatChange(now.roas !== null && before.roas !== null ? now.roas - before.roas : null, '%p'),
    },
    {
      label: '전체 CPA',
      hint: '구매 1건당 광고비',
      value: metrics.cpa,
      accent: true,
      recent: nowShown?.cpa,
      change: week && formatChange(changeRate(now.cpa, before.cpa)),
    },
  ]

  return (
    <section className="summary-cards" aria-label="합계">
      {cards.map((card) => (
        <div key={card.label} className="glass summary-card">
          <span className="summary-label">
            {card.label}
            {card.hint && <span className="summary-hint">{card.hint}</span>}
          </span>
          <strong className={card.accent ? 'summary-value accent' : 'summary-value'}>
            {card.value}
          </strong>
          {week && (
            <span className="summary-week">
              최근 7일({shortDate(week.currentFrom)}~{shortDate(week.currentTo)}) {card.recent}
              <span className="summary-change">전주 대비 {card.change}</span>
            </span>
          )}
        </div>
      ))}
    </section>
  )
}

export default SummaryCards
