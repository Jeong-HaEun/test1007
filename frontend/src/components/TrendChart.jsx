import { useEffect, useState } from 'react'
import {
  CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

// SVG 속성에는 CSS 변수를 쓸 수 없어 index.css 의 값을 그대로 옮겨 둔다
const COLORS = {
  line: '#E54331', // --accent-tomato
  surface: '#FAF5F2', // --bg-base (점 테두리)
  text: '#1A1210', // --text-main
  muted: '#5F524E', // --text-muted
  grid: 'rgba(26, 18, 16, 0.08)',
}

// App.css 의 모바일 기준과 같은 값
const NARROW_QUERY = '(max-width: 640px)'

/**
 * 지표 하나의 선 그래프 (일자별·월별 추이 공용). 값이 null 인 점은 선을 끊는다.
 * data: [{ label(가로축), tooltipLabel(툴팁 제목), [dataKey]: 숫자 | null }]
 */
function TrendChart({ title, data, dataKey, format, tickFormat }) {
  const lastIndex = data.findLastIndex((point) => point[dataKey] !== null)

  // 좁은 화면이면 축·여백을 줄여 선이 그려질 공간을 넓힌다
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW_QUERY).matches)
  useEffect(() => {
    const query = window.matchMedia(NARROW_QUERY)
    const onChange = (event) => setNarrow(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  const fontSize = narrow ? 11 : 12

  return (
    <figure className="glass trend-chart">
      <figcaption>{title}</figcaption>
      <ResponsiveContainer width="100%" height={narrow ? 200 : 240}>
        <LineChart data={data} margin={{ top: 16, right: narrow ? 48 : 56, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={COLORS.grid} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: COLORS.grid }}
            tick={{ fill: COLORS.muted, fontSize }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={tickFormat}
            tickLine={false}
            axisLine={false}
            tick={{ fill: COLORS.muted, fontSize }}
            width={narrow ? 48 : 72}
          />
          <Tooltip
            formatter={(value) => [format(value), title]}
            labelFormatter={(_, payload) => payload?.[0]?.payload.tooltipLabel}
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
                  <text x={x + 10} y={y} dy={4} fill={COLORS.text} fontSize={fontSize} fontWeight={600}>
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

export default TrendChart
