// 백엔드 /api/reports 호출은 이 파일에서만 한다.
// 주소는 VITE_API_BASE_URL (frontend/.env) 로 받는다.

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/reports`

const ERROR_MESSAGES = {
  400: '입력값을 확인해 주세요 (빈칸, 음수, 100자 초과 등)',
  404: '이미 삭제된 데이터예요. 새로고침해 주세요',
  409: '같은 날짜·매체·캠페인·광고그룹·소재의 데이터가 이미 있어요. 기존 줄을 수정해 주세요',
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) {
    throw new Error(ERROR_MESSAGES[response.status] ?? `API 요청 실패 (HTTP ${response.status})`)
  }
  // 삭제(204)는 응답 본문이 없다
  return response.status === 204 ? null : response.json()
}

export function fetchReports() {
  return request('')
}

export function createReport(report) {
  return request('', { method: 'POST', body: JSON.stringify(report) })
}

/** CSV 일괄 등록. 같은 날짜·매체·캠페인·광고그룹·소재는 덮어쓴다. 반환: { created, updated } */
export function bulkUpsertReports(reports) {
  return request('/bulk', { method: 'POST', body: JSON.stringify(reports) })
}

export function updateReport(id, report) {
  return request(`/${id}`, { method: 'PUT', body: JSON.stringify(report) })
}

export function deleteReport(id) {
  return request(`/${id}`, { method: 'DELETE' })
}
