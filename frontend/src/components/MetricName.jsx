// 지표 이름. 낯선 약어(CPB)는 마우스를 올리면 전체 이름이 보이게 한다.
const FULL_NAMES = {
  CPB: 'CPB (Cost Per Basket) · 장바구니 1건당 광고비',
}

function MetricName({ name }) {
  const full = FULL_NAMES[name]
  return full ? <abbr title={full}>{name}</abbr> : name
}

export default MetricName
