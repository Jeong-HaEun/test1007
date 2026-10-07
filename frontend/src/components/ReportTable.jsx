import { calcMetrics, formatMetrics, formatNumber } from '../utils/metrics.js'

const TEXT_COLUMNS = ['날짜', '매체', '캠페인', '광고그룹', '소재']
const NUMBER_COLUMNS = ['광고비', '노출', '클릭', '장바구니', '전환', '매출']
const METRIC_COLUMNS = ['CTR', 'CPC', 'CPB', 'CPA', 'ROAS']

/** 성과 표: 원본 값 + 계산 지표 (지표 계산은 metrics.js 에서만) */
function ReportTable({ reports }) {
  if (reports.length === 0) {
    return <p className="glass status">표시할 데이터가 없습니다.</p>
  }

  return (
    <div className="glass table-wrap">
      <table className="report-table">
        <thead>
          <tr>
            {TEXT_COLUMNS.map((name) => <th key={name}>{name}</th>)}
            {NUMBER_COLUMNS.map((name) => <th key={name} className="num">{name}</th>)}
            {METRIC_COLUMNS.map((name) => <th key={name} className="num metric">{name}</th>)}
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => {
            const metrics = formatMetrics(calcMetrics(report))
            return (
              <tr key={report.id}>
                <td>{report.reportDate}</td>
                <td>{report.media}</td>
                <td>{report.campaignName}</td>
                <td>{report.adGroupName}</td>
                <td>{report.creativeName}</td>
                <td className="num">{formatNumber(report.cost)}</td>
                <td className="num">{formatNumber(report.impressions)}</td>
                <td className="num">{formatNumber(report.clicks)}</td>
                <td className="num">{formatNumber(report.carts)}</td>
                <td className="num">{formatNumber(report.conversions)}</td>
                <td className="num">{formatNumber(report.revenue)}</td>
                <td className="num metric">{metrics.ctr}</td>
                <td className="num metric">{metrics.cpc}</td>
                <td className="num metric">{metrics.cpb}</td>
                <td className="num metric">{metrics.cpa}</td>
                <td className="num metric">{metrics.roas}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ReportTable
