import { calcMetrics, creativeBreakdown, formatMetrics, formatNumber, formatWon } from '../utils/metrics.js'

// 광고비가 너무 적은 소재는 우연히 ROAS 가 튈 수 있어 순위에서 뺀다
const MIN_COST = 100000
const TOP_N = 5

function CreativeRows({ creatives, rankFrom, step }) {
  return creatives.map((creative, index) => {
    const shown = formatMetrics(calcMetrics(creative.totals))
    return (
      <tr key={creative.key}>
        <td className="num rank">{rankFrom + index * step}</td>
        <td>{creative.media}</td>
        <td>
          <strong>{creative.creativeName}</strong>
          <span className="creative-path">{creative.campaignName} › {creative.adGroupName}</span>
        </td>
        <td className="num">{formatNumber(creative.totals.cost)}</td>
        <td className="num">{formatNumber(creative.totals.conversions)}</td>
        <td className="num metric">{shown.cpa}</td>
        <td className="num metric">{shown.roas}</td>
      </tr>
    )
  })
}

function RankTable({ title, caption, creatives, rankFrom, step }) {
  return (
    <div className="glass table-wrap">
      <table className="report-table">
        <caption className="table-caption">
          <strong>{title}</strong> · {caption}
        </caption>
        <thead>
          <tr>
            <th className="num">순위</th>
            <th>매체</th>
            <th>소재 (캠페인 › 광고그룹)</th>
            <th className="num">광고비</th>
            <th className="num">전환</th>
            <th className="num metric">CPA</th>
            <th className="num metric">ROAS</th>
          </tr>
        </thead>
        <tbody>
          <CreativeRows creatives={creatives} rankFrom={rankFrom} step={step} />
        </tbody>
      </table>
    </div>
  )
}

/** 소재 인사이트: ROAS 상위·하위 소재 + 전환 없는 소재 경고 */
function CreativeInsights({ reports }) {
  const creatives = creativeBreakdown(reports)

  // 광고비를 썼는데 전환이 0 → 끄거나 바꿀 후보 (광고비 큰 순)
  const noConversion = creatives
    .filter(({ totals }) => totals.cost > 0 && totals.conversions === 0)
    .sort((a, b) => b.totals.cost - a.totals.cost)

  const ranked = creatives
    .filter(({ totals }) => totals.cost >= MIN_COST && totals.conversions > 0)
    .sort((a, b) => calcMetrics(b.totals).roas - calcMetrics(a.totals).roas)
  const top = ranked.slice(0, TOP_N)
  // 하위는 상위와 겹치지 않게 (소재가 10개 미만일 때)
  const bottom = ranked.slice(TOP_N).slice(-TOP_N).reverse()

  return (
    <section className="section">
      <h2>
        소재 인사이트
        <span className="section-sub">
          무엇을 늘리고 무엇을 끌지 · 광고비 {formatWon(MIN_COST)} 이상 소재만 순위에 포함
        </span>
      </h2>

      {noConversion.length > 0 ? (
        <div className="glass insight-alert" role="status">
          <strong>⚠️ 광고비를 썼지만 전환이 없는 소재 {noConversion.length}개</strong>
          <ul>
            {noConversion.slice(0, TOP_N).map((creative) => (
              <li key={creative.key}>
                {creative.media} · {creative.campaignName} › {creative.adGroupName} › <strong>{creative.creativeName}</strong>
                {' '}— 광고비 {formatWon(creative.totals.cost)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="glass status">✅ 광고비를 쓰고 전환이 0인 소재는 없어요.</p>
      )}

      {ranked.length === 0 ? (
        <p className="glass status">순위를 매길 소재가 없어요. (광고비 {formatWon(MIN_COST)} 이상 + 전환 1건 이상)</p>
      ) : (
        <div className="insight-tables">
          <RankTable title="ROAS 상위 소재" caption="예산을 늘릴 후보" creatives={top} rankFrom={1} step={1} />
          {bottom.length > 0 && (
            <RankTable
              title="ROAS 하위 소재"
              caption="소재 교체·입찰 조정 후보"
              creatives={bottom}
              rankFrom={ranked.length}
              step={-1}
            />
          )}
        </div>
      )}
    </section>
  )
}

export default CreativeInsights
