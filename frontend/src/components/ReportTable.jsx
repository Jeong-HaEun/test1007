import { calcMetrics, formatMetrics, formatNumber } from '../utils/metrics.js'

/** 성과 표: 원본 값 + 계산 지표 (지표 계산은 metrics.js 에서만) */
function ReportTable({ reports }) {
  if (reports.length === 0) {
    return <p>표시할 데이터가 없습니다.</p>
  }

  return (
    <table className="report-table">
      <thead>
        <tr>
          <th>날짜</th>
          <th>매체</th>
          <th>캠페인</th>
          <th>광고그룹</th>
          <th>소재</th>
          <th>광고비</th>
          <th>노출</th>
          <th>클릭</th>
          <th>장바구니</th>
          <th>전환</th>
          <th>매출</th>
          <th>CTR</th>
          <th>CPC</th>
          <th>CPB</th>
          <th>CPA</th>
          <th>ROAS</th>
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
              <td>{formatNumber(report.cost)}</td>
              <td>{formatNumber(report.impressions)}</td>
              <td>{formatNumber(report.clicks)}</td>
              <td>{formatNumber(report.carts)}</td>
              <td>{formatNumber(report.conversions)}</td>
              <td>{formatNumber(report.revenue)}</td>
              <td>{metrics.ctr}</td>
              <td>{metrics.cpc}</td>
              <td>{metrics.cpb}</td>
              <td>{metrics.cpa}</td>
              <td>{metrics.roas}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default ReportTable
