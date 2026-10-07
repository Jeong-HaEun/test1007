import { calcMetrics, formatMetrics, formatWon, sumReports } from '../utils/metrics.js'

/** 상단 합계 카드. 전체 지표는 합계끼리 나눈다 (행별 평균 아님) */
function SummaryCards({ reports }) {
  const totals = sumReports(reports)
  const metrics = formatMetrics(calcMetrics(totals))

  const cards = [
    { label: '총 광고비', value: formatWon(totals.cost) },
    { label: '총 매출', value: formatWon(totals.revenue) },
    { label: '전체 ROAS', hint: '매출 ÷ 광고비', value: metrics.roas, accent: true },
    { label: '전체 CPA', hint: '구매 1건당 광고비', value: metrics.cpa, accent: true },
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
        </div>
      ))}
    </section>
  )
}

export default SummaryCards
