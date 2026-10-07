import { calcMetrics, formatFunnel, formatNumber, sumReports } from '../utils/metrics.js'

const MEDIA = ['NAVER', 'META', 'GOOGLE']

// 매체 비교 표의 비율 칸. 매체끼리 비교해 가장 낮은 값에 '최저' 표시 (병목 후보)
const RATE_COLUMNS = [
  { field: 'ctr', label: 'CTR', hint: '클릭 ÷ 노출' },
  { field: 'cartRate', label: '장바구니 담기율', hint: '장바구니 ÷ 클릭' },
  { field: 'purchaseRate', label: '장바구니 → 구매율', hint: '전환 ÷ 장바구니' },
  { field: 'cvr', label: '구매 전환율', hint: '전환 ÷ 클릭' },
]

/**
 * 퍼널 분석: 노출 → 클릭 → 장바구니 → 구매 단계별 비율.
 * reports: 단계 흐름에 쓰는 (필터된) 데이터 / allReports: 매체 비교용 전체 데이터
 */
function FunnelSection({ reports, allReports }) {
  const totals = sumReports(reports)
  const funnel = formatFunnel(calcMetrics(totals))

  const steps = [
    { label: '노출', count: totals.impressions },
    { label: '클릭', count: totals.clicks, rate: funnel.ctr, rateLabel: 'CTR' },
    { label: '장바구니', count: totals.carts, rate: funnel.cartRate, rateLabel: '담기율' },
    { label: '구매', count: totals.conversions, rate: funnel.purchaseRate, rateLabel: '장바구니→구매' },
  ]

  const byMedia = MEDIA.map((media) => {
    const mediaTotals = sumReports(allReports.filter((row) => row.media === media))
    return { media, metrics: calcMetrics(mediaTotals), shown: formatFunnel(calcMetrics(mediaTotals)) }
  }).filter(({ metrics }) => metrics.ctr !== null)

  // 칸마다 가장 낮은 매체 (2개 매체 이상일 때만 의미 있음)
  const lowest = Object.fromEntries(
    RATE_COLUMNS.map(({ field }) => {
      const values = byMedia.filter(({ metrics }) => metrics[field] !== null)
      if (values.length < 2) return [field, null]
      return [field, values.reduce((min, row) => (row.metrics[field] < min.metrics[field] ? row : min)).media]
    }),
  )

  return (
    <section className="section">
      <h2>
        퍼널 분석
        <span className="section-sub">어느 단계에서 고객이 빠지는지 · 전체 기간</span>
      </h2>

      <div className="glass funnel-steps">
        {steps.map((step) => (
          <div key={step.label} className="funnel-step">
            {step.rate && (
              <span className="funnel-rate" aria-label={`${step.rateLabel} ${step.rate}`}>
                <span aria-hidden="true">→</span> {step.rateLabel} <strong>{step.rate}</strong>
              </span>
            )}
            <span className="funnel-label">{step.label}</span>
            <strong className="funnel-count">{formatNumber(step.count)}</strong>
          </div>
        ))}
        <div className="funnel-step funnel-summary">
          <span className="funnel-label">구매 전환율</span>
          <strong className="funnel-count accent">{funnel.cvr}</strong>
          <span className="funnel-label">객단가</span>
          <strong className="funnel-count accent">{funnel.aov}</strong>
        </div>
      </div>

      {byMedia.length > 0 && (
        <div className="glass table-wrap">
          <table className="report-table">
            <caption className="table-caption">
              매체별 퍼널 비교 (매체 필터와 관계없이 3개 매체 모두) · <strong>최저</strong> = 매체 중 가장 낮은 단계, 개선 우선 후보
            </caption>
            <thead>
              <tr>
                <th>매체</th>
                {RATE_COLUMNS.map(({ field, label, hint }) => (
                  <th key={field} className="num"><abbr title={hint}>{label}</abbr></th>
                ))}
                <th className="num">객단가</th>
              </tr>
            </thead>
            <tbody>
              {byMedia.map(({ media, shown }) => (
                <tr key={media}>
                  <td>{media}</td>
                  {RATE_COLUMNS.map(({ field }) => (
                    <td key={field} className="num">
                      {shown[field]}
                      {lowest[field] === media && <span className="badge-low">최저</span>}
                    </td>
                  ))}
                  <td className="num">{shown.aov}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default FunnelSection
