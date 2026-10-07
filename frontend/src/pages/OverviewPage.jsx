import { useState } from 'react'
import { DailyTable, DailyTrendCharts } from '../components/DailyTrend.jsx'
import FunnelSection from '../components/FunnelSection.jsx'
import MediaFilter from '../components/MediaFilter.jsx'
import { MonthlyTable, MonthlyTrendCharts } from '../components/MonthlySummary.jsx'
import SummaryCards from '../components/SummaryCards.jsx'
import { MEDIA_ALL, filterByMedia } from '../utils/metrics.js'

/** 요약 페이지: 그래프를 위에, 표를 아래에 둔다 */
function OverviewPage({ reports }) {
  const [media, setMedia] = useState(MEDIA_ALL)
  const visible = filterByMedia(reports, media)

  return (
    <>
      <MediaFilter value={media} onChange={setMedia} />
      <SummaryCards reports={visible} />
      <FunnelSection reports={visible} allReports={reports} />
      <DailyTrendCharts reports={visible} />
      <MonthlyTrendCharts reports={visible} />
      <MonthlyTable reports={visible} />
      <DailyTable reports={visible} />
    </>
  )
}

export default OverviewPage
