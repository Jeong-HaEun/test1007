import {
  CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  calcMetrics, dailyTrend, formatMetrics, formatNumber, formatPercent, formatWon,
} from '../utils/metrics.js'

// SVG 속성에는 CSS 변수를 쓸 수 없어 index.css 의 값을 그대로 옮겨 둔다
const COLORS = {
  line: '#E54331', // --accent-tomato
  surface: '#FAF5F2', // --bg-base (점 테두리)
  text: '#1A1210', // --text-main
  muted: '#5F524E', // --text-muted
  grid: 'rgba(26, 18, 16, 0.08)',
}

const DAYS = 14

/** '2026-10-07' -> '10/7' */
function shortDate(isoDate) {
  const [, month, day] = isoDate.split('-')
  return `${Number(month)}/${Number(day)}`
}

/** 지표 하나의 선 그래프. 값이 null 인 날은 선을 끊는다 */
function TrendChart({ title, data, dataKey, format, tickFormat }) {
  const lastIndex = data.findLastIndex((point) => point[dataKey] !== null)

  return (
    <figure className="glass trend-chart">
      <figcaption>{title}</figcaption>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 16, right: 56, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={COLORS.grid} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: COLORS.grid }}
            tick={{ fill: COLORS.muted, fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={tickFormat}
            tickLine={false}
            axisLine={false}
            tick={{ fill: COLORS.muted, fontSize: 12 }}
            width={72}
          />
          <Tooltip
            formatter={(value) => [format(value), title]}
            labelFormatter={(_, payload) => payload?.[0]?.payload.date}
            cursor={{ stroke: COLORS.line, strokeOpacity: 0.3 }}
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              color: COLORS.text,
            }}
          />
          <Line
            type="linear"
            dataKey={dataKey}
            stroke={COLORS.line}
            strokeWidth={2}
            dot={{ r: 4, fill: COLORS.line, stroke: COLORS.surface, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: COLORS.line, stroke: COLORS.surface, strokeWidth: 2 }}
            connectNulls={false}
            isAnimationActive={false}
          >
            {/* 마지막 값만 선 끝에 표시 */}
            <LabelList
              dataKey={dataKey}
              content={({ x, y, index, value }) =>
                index === lastIndex ? (
                  <text x={x + 10} y={y} dy={4} fill={COLORS.text} fontSize={12} fontWeight={600}>
                    {format(value)}
                  </text>
                ) : null
              }
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </figure>
  )
}

/** 일자별 성과 추이: 최근 14일 CPA·ROAS 그래프 + 일자별 표 */
function DailyTrend({ reports }) {
  const trend = dailyTrend(reports, DAYS)

  if (trend.length === 0) {
    return (
      <section className="section">
        <h2>일자별 성과 추이</h2>
        <p className="glass status">표시할 데이터가 없습니다.</p>
      </section>
    )
  }

  const points = trend.map(({ date, totals }) => {
    const metrics = totals ? calcMetrics(totals) : { cpa: null, roas: null }
    return { date, label: shortDate(date), cpa: metrics.cpa, roas: metrics.roas, totals }
  })

  return (
    <section className="section">
      <h2>
        일자별 성과 추이
        <span className="section-sub">
          최근 {DAYS}일 · {trend[0].date} ~ {trend.at(-1).date}
        </span>
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

export default DailyTrend
