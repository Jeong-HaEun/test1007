// CSV 업로드: 파일 읽기(한글 인코딩 처리) → 검사 → API 로 보낼 행 목록 만들기

import Papa from 'papaparse'

// BOM: 파일 맨 앞의 보이지 않는 표시. 엑셀이 이걸 보고 UTF-8 로 연다.
export const BOM = String.fromCharCode(0xfeff)

// CSV 제목 줄(한글) -> API 필드명. 순서가 곧 양식의 열 순서다.
export const CSV_COLUMNS = [
  { header: '날짜', field: 'reportDate' },
  { header: '매체', field: 'media' },
  { header: '캠페인', field: 'campaignName' },
  { header: '광고그룹', field: 'adGroupName' },
  { header: '소재', field: 'creativeName' },
  { header: '광고비', field: 'cost' },
  { header: '노출', field: 'impressions' },
  { header: '클릭', field: 'clicks' },
  { header: '장바구니', field: 'carts' },
  { header: '전환', field: 'conversions' },
  { header: '매출', field: 'revenue' },
]

const TEXT_FIELDS = ['campaignName', 'adGroupName', 'creativeName']
const NUMBER_FIELDS = ['cost', 'impressions', 'clicks', 'carts', 'conversions', 'revenue']

// 한글 매체명도 받아준다
const MEDIA_ALIASES = {
  NAVER: 'NAVER', 네이버: 'NAVER',
  META: 'META', 메타: 'META', FACEBOOK: 'META', 페이스북: 'META', INSTAGRAM: 'META', 인스타그램: 'META',
  GOOGLE: 'GOOGLE', 구글: 'GOOGLE',
}

/**
 * 파일 바이트를 글자로 바꾼다.
 * UTF-8 로 먼저 읽고, 깨지면(엑셀 기본 저장 = CP949) EUC-KR 로 다시 읽는다.
 */
export function decodeCsv(buffer) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch {
    return new TextDecoder('euc-kr').decode(buffer)
  }
}

/** 2026-10-01, 2026/10/01, 2026.10.01, 2026-10-1 -> '2026-10-01'. 잘못된 날짜면 null */
function normalizeDate(value) {
  const match = value.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/)
  if (!match) return null
  const [, year, month, day] = match
  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  const date = new Date(`${iso}T00:00:00Z`)
  // 13월, 2월 30일 같은 날짜 거르기
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().startsWith(iso) ? iso : null
}

/** '100,000', '100000원', ' 100000 ' -> 100000. 0 이상 정수가 아니면 null */
function normalizeNumber(value) {
  const cleaned = value.replace(/[,\s원]/g, '')
  if (!/^\d+$/.test(cleaned)) return null
  return Number(cleaned)
}

/**
 * CSV 글자를 검사해 행 목록으로 바꾼다.
 * 반환: { rows, errors }. errors 가 하나라도 있으면 업로드하지 않는다.
 * 줄 번호는 엑셀에서 보이는 번호 (제목 줄 = 1).
 */
export function parseReportCsv(text) {
  const body = text.startsWith(BOM) ? text.slice(1) : text
  const result = Papa.parse(body, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim(),
  })

  const headers = result.meta.fields ?? []
  const missing = CSV_COLUMNS.filter((column) => !headers.includes(column.header))
  if (missing.length > 0) {
    return {
      rows: [],
      errors: [`제목 줄에 없는 칸: ${missing.map((column) => column.header).join(', ')} (양식을 내려받아 확인하세요)`],
    }
  }

  const rows = []
  const errors = []

  result.data.forEach((record, index) => {
    const line = index + 2
    const row = {}

    for (const { header, field } of CSV_COLUMNS) {
      const raw = (record[header] ?? '').trim()

      if (field === 'reportDate') {
        row[field] = normalizeDate(raw)
        if (!row[field]) errors.push(`${line}번째 줄: 날짜 "${raw}" 형식이 잘못됐어요 (예: 2026-10-01)`)
      } else if (field === 'media') {
        row[field] = MEDIA_ALIASES[raw.toUpperCase()] ?? null
        if (!row[field]) errors.push(`${line}번째 줄: 매체 "${raw}"는 쓸 수 없어요 (NAVER / META / GOOGLE)`)
      } else if (TEXT_FIELDS.includes(field)) {
        row[field] = raw
        if (!raw) errors.push(`${line}번째 줄: ${header}이(가) 비어 있어요`)
        else if (raw.length > 100) errors.push(`${line}번째 줄: ${header}은(는) 100자 이하여야 해요`)
      } else if (NUMBER_FIELDS.includes(field)) {
        row[field] = normalizeNumber(raw)
        if (row[field] === null) errors.push(`${line}번째 줄: ${header} "${raw}"는 0 이상의 정수여야 해요`)
      }
    }

    rows.push(row)
  })

  if (result.data.length === 0) {
    errors.push('데이터 줄이 없어요. 제목 줄 아래에 내용을 채워 주세요.')
  }

  return { rows, errors }
}

/**
 * 빈 양식 CSV 내용. 맨 앞 BOM 문자 덕분에 엑셀에서 열어도 한글이 깨지지 않는다.
 */
export function buildTemplateCsv() {
  return `${BOM}${CSV_COLUMNS.map((column) => column.header).join(',')}\r\n`
}
