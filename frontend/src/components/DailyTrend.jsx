import TrendChart from './TrendChart.jsx'
import {
  calcMetrics, dailyTrend, formatMetrics, formatNumber, formatPercent, formatWon,
} from '../utils/metrics.js'

const DAYS = 14

/** '2026-10-07' -> '10/7' */
function shortDate(isoDate) {
  const [, month, day] = isoDate.split('-')
  return `${Number(month)}/${Number(day)}`
}

function buildPoints(reports) {
  return dailyTrend(reports, DAYS).map(({ date, totals }) => {
    const metrics = totals ? calcMetrics(totals) : { cpa: null, roas: null }
    return { date, label: shortDate(date), tooltipLabel: date, cpa: metrics.cpa, roas: metrics.roas, totals }
  })
}

function Period({ points }) {
  return (
    <span className="section-sub">
      최근 {DAYS}일 · {points[0].date} ~ {points.at(-1).date}
    </span>
  )
}

function Empty({ title }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      <p className="glass status">표시할 데이터가 없습니다.</p>
    </section>
  )
}

/** 일자별 성과 추이: 최근 14일 CPA·ROAS 그래프 */
export function DailyTrendCharts({ reports }) {
  const points = buildPoints(reports)
  if (points.length === 0) return <Empty title="일자별 성과 추이" />

  return (
    <section className="section">
      <h2>
        일자별 성과 추이
        <Period points={points} />
      </h2>
      <div className="trend-charts">
        <TrendChart
          title="CPA 추이"
          data={points}
          dataKey="cpa"
          format={formatWon}
          tickFormat={(value) => formatNumber(Math.round(value))}
        />
        <TrendChart
          title="ROAS 추이"
          data={points}
          dataKey="roas"
          format={(value) => formatPercent(value, 0)}
          tickFormat={(value) => formatPercent(value, 0)}
        />
      </div>
    </section>
  )
}

/** 일자별 성과 데이터: 최근 14일 표 (최신 날짜부터) */
export function DailyTable({ reports }) {
  const points = buildPoints(reports)
  if (points.length === 0) return <Empty title="일자별 성과 데이터" />

  return (
    <section className="section">
      <h2>
        일자별 성과 데이터
        <Period points={points} />
      </h2>
      <div className="glass table-wrap">
        <table className="report-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th className="num">광고비</th>
              <th className="num">전환</th>
              <th className="num">매출</th>
              <th className="num metric">CPA</th>
              <th className="num metric">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {[...points].reverse().map(({ date, totals }) => {
              const metrics = totals ? formatMetrics(calcMetrics(totals)) : { cpa: '-', roas: '-' }
              return (
                <tr key={date}>
                  <td>{date}</td>
                  <td className="num">{totals ? formatNumber(totals.cost) : '-'}</td>
                  <td className="num">{totals ? formatNumber(totals.conversions) : '-'}</td>
                  <td className="num">{totals ? formatNumber(totals.revenue) : '-'}</td>
                  <td className="num metric">{metrics.cpa}</td>
                  <td className="num metric">{metrics.roas}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
