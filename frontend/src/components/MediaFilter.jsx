import { MEDIA_ALL } from '../utils/metrics.js'

const OPTIONS = [
  { value: MEDIA_ALL, label: '전체' },
  { value: 'NAVER', label: 'NAVER' },
  { value: 'META', label: 'META' },
  { value: 'GOOGLE', label: 'GOOGLE' },
]

/** 매체 선택 버튼. value: 선택된 매체, onChange: 버튼을 누르면 호출, label: 보조기기용 이름 */
function MediaFilter({ value, onChange, label = '매체 필터' }) {
  return (
    <div className="media-filter" role="group" aria-label={label}>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default MediaFilter
