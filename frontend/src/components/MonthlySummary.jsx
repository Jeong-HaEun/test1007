import { calcMetrics, formatMetrics, formatNumber, monthlyTotals } from '../utils/metrics.js'

const NUMBER_COLUMNS = [
  { field: 'cost', label: '광고비' },
  { field: 'impressions', label: '노출' },
  { field: 'clicks', label: '클릭' },
  { field: 'carts', label: '장바구니' },
  { field: 'conversions', label: '전환' },
  { field: 'revenue', label: '매출' },
]
const METRIC_COLUMNS = [
  { field: 'ctr', label: 'CTR' },
  { field: 'cpc', label: 'CPC' },
  { field: 'cpb', label: 'CPB' },
  { field: 'cpa', label: 'CPA' },
  { field: 'roas', label: 'ROAS' },
]

/** 월 누적 성과: 월별 합계 + 지표 (이번 달은 지금까지 누적) */
function MonthlySummary({ reports }) {
  const months = monthlyTotals(reports)

  return (
    <section className="section">
      <h2>월 누적 성과</h2>
      {months.length === 0 ? (
        <p className="glass status">표시할 데이터가 없습니다.</p>
      ) : (
        <div className="glass table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>월</th>
                {NUMBER_COLUMNS.map(({ field, label }) => <th key={field} className="num">{label}</th>)}
                {METRIC_COLUMNS.map(({ field, label }) => <th key={field} className="num metric">{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {months.map(({ month, totals }) => {
                const metrics = formatMetrics(calcMetrics(totals))
                return (
                  <tr key={month}>
                    <td>{month}</td>
                    {NUMBER_COLUMNS.map(({ field }) => (
                      <td key={field} className="num">{formatNumber(totals[field])}</td>
                    ))}
                    {METRIC_COLUMNS.map(({ field }) => (
                      <td key={field} className="num metric">{metrics[field]}</td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default MonthlySummary
