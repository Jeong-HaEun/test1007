// 백엔드 /api/reports 호출은 이 파일에서만 한다.
// 주소는 VITE_API_BASE_URL (frontend/.env) 로 받는다.

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/reports`

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) {
    throw new Error(`API 요청 실패 (HTTP ${response.status})`)
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

export function updateReport(id, report) {
  return request(`/${id}`, { method: 'PUT', body: JSON.stringify(report) })
}

export function deleteReport(id) {
  return request(`/${id}`, { method: 'DELETE' })
}
