import { useState } from 'react'
import { calcMetrics, campaignBreakdown, formatMetrics, formatNumber } from '../utils/metrics.js'

const NUMBER_FIELDS = ['cost', 'impressions', 'clicks', 'carts', 'conversions', 'revenue']
const METRIC_FIELDS = ['ctr', 'cpc', 'cpb', 'cpa', 'roas']

function NumberCells({ totals }) {
  const metrics = formatMetrics(calcMetrics(totals))
  return (
    <>
      {NUMBER_FIELDS.map((field) => <td key={field} className="num">{formatNumber(totals[field])}</td>)}
      {METRIC_FIELDS.map((field) => <td key={field} className="num metric">{metrics[field]}</td>)}
    </>
  )
}

/** 캠페인별 성과. 캠페인 행을 누르면 광고그룹이 펼쳐진다 */
function CampaignTable({ reports }) {
  const [openKeys, setOpenKeys] = useState(() => new Set())
  const campaigns = campaignBreakdown(reports)

  function toggle(key) {
    setOpenKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (campaigns.length === 0) {
    return <p className="glass status">표시할 데이터가 없습니다.</p>
  }

  const allOpen = campaigns.every((campaign) => openKeys.has(campaign.key))

  return (
    <div className="glass table-wrap">
      <table className="report-table campaign-table">
        <thead>
          <tr>
            <th>매체</th>
            <th>
              캠페인 / 광고그룹
              <button
                type="button"
                className="row-button"
                onClick={() => setOpenKeys(allOpen ? new Set() : new Set(campaigns.map((c) => c.key)))}
              >
                {allOpen ? '모두 접기' : '모두 펼치기'}
              </button>
            </th>
            <th className="num">광고비</th>
            <th className="num">노출</th>
            <th className="num">클릭</th>
            <th className="num">장바구니</th>
            <th className="num">전환</th>
            <th className="num">매출</th>
            <th className="num metric">CTR</th>
            <th className="num metric">CPC</th>
            <th className="num metric">CPB</th>
            <th className="num metric">CPA</th>
            <th className="num metric">ROAS</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => {
            const open = openKeys.has(campaign.key)
            return [
              <tr key={campaign.key} className="campaign-row">
                <td>{campaign.media}</td>
                <td>
                  <button
                    type="button"
                    className="expand-button"
                    aria-expanded={open}
                    onClick={() => toggle(campaign.key)}
                  >
                    <span aria-hidden="true">{open ? '▾' : '▸'}</span>
                    {campaign.campaignName}
                    <span className="expand-count">광고그룹 {campaign.adGroups.length}</span>
                  </button>
                </td>
                <NumberCells totals={campaign.totals} />
              </tr>,
              ...(open
                ? campaign.adGroups.map((adGroup) => (
                    <tr key={adGroup.key} className="ad-group-row">
                      <td />
                      <td className="ad-group-name">{adGroup.adGroupName}</td>
                      <NumberCells totals={adGroup.totals} />
                    </tr>
                  ))
                : []),
            ]
          })}
        </tbody>
      </table>
    </div>
  )
}

export default CampaignTable
