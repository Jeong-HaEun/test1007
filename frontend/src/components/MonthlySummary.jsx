import TrendChart from './TrendChart.jsx'
import {
  calcMetrics, changeRate, formatChange, formatMetrics, formatNumber, formatPercent, formatWon,
  monthlyTrend,
} from '../utils/metrics.js'

const MONTHS = 3

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
]

/** '2026-10' -> '10월' */
function shortMonth(yearMonth) {
  return `${Number(yearMonth.slice(5))}월`
}

/** 최근 3개월 행. CPA 전월 대비는 증감률, ROAS 는 %p 차이 */
function buildRows(reports) {
  return monthlyTrend(reports, MONTHS).map(({ month, totals, previous }) => {
    const metrics = totals ? calcMetrics(totals) : null
    const before = previous ? calcMetrics(previous) : null
    return {
      month,
      totals,
      metrics,
      label: shortMonth(month),
      tooltipLabel: month,
      cpa: metrics?.cpa ?? null,
      roas: metrics?.roas ?? null,
      cpaChange: changeRate(metrics?.cpa ?? null, before?.cpa ?? null),
      roasChange:
        metrics?.roas != null && before?.roas != null ? metrics.roas - before.roas : null,
    }
  })
}

function Period({ rows }) {
  return (
    <span className="section-sub">
      최근 {MONTHS}개월 · {rows[0].month} ~ {rows.at(-1).month} · 이번 달은 지금까지 누적
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

/** 월 누적 성과 추이: 최근 3개월 CPA·ROAS 그래프 */
export function MonthlyTrendCharts({ reports }) {
  const rows = buildRows(reports)
  if (rows.length === 0) return <Empty title="월 누적 성과 추이" />

  return (
    <section className="section">
      <h2>
        월 누적 성과 추이
        <Period rows={rows} />
      </h2>
      <div className="trend-charts">
        <TrendChart
          title="월별 CPA"
          data={rows}
          dataKey="cpa"
          format={formatWon}
          tickFormat={(value) => formatNumber(Math.round(value))}
        />
        <TrendChart
          title="월별 ROAS"
          data={rows}
          dataKey="roas"
          format={(value) => formatPercent(value, 0)}
          tickFormat={(value) => formatPercent(value, 0)}
        />
      </div>
    </section>
  )
}

/** 월 누적 데이터: 최근 3개월 표 (최신 월부터, 전월 대비 포함) */
export function MonthlyTable({ reports }) {
  const rows = buildRows(reports)
  if (rows.length === 0) return <Empty title="월 누적 데이터" />

  return (
    <section className="section">
      <h2>
        월 누적 데이터
        <Period rows={rows} />
      </h2>
      <div className="glass table-wrap">
        <table className="report-table">
          <thead>
            <tr>
              <th>월</th>
              {NUMBER_COLUMNS.map(({ field, label }) => <th key={field} className="num">{label}</th>)}
              {METRIC_COLUMNS.map(({ field, label }) => <th key={field} className="num metric">{label}</th>)}
              <th className="num metric">CPA</th>
              <th className="num">전월 대비</th>
              <th className="num metric">ROAS</th>
              <th className="num">전월 대비</th>
            </tr>
          </thead>
          <tbody>
            {[...rows].reverse().map(({ month, totals, metrics, cpaChange, roasChange }) => {
              const shown = metrics ? formatMetrics(metrics) : null
              return (
                <tr key={month}>
                  <td>{month}</td>
                  {NUMBER_COLUMNS.map(({ field }) => (
                    <td key={field} className="num">{totals ? formatNumber(totals[field]) : '-'}</td>
                  ))}
                  {METRIC_COLUMNS.map(({ field }) => (
                    <td key={field} className="num metric">{shown ? shown[field] : '-'}</td>
                  ))}
                  <td className="num metric">{shown ? shown.cpa : '-'}</td>
                  <td className="num change">{formatChange(cpaChange, '%')}</td>
                  <td className="num metric">{shown ? shown.roas : '-'}</td>
                  <td className="num change">{formatChange(roasChange, '%p')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
