import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BOM, buildTemplateCsv, decodeCsv, parseReportCsv } from './csv.js'

const HEADER = '날짜,매체,캠페인,광고그룹,소재,광고비,노출,클릭,장바구니,전환,매출'

test('정상 CSV 를 API 형식 행으로 바꾼다', () => {
  const csv = `${HEADER}\n2026-10-01,NAVER,가을 세일,브랜드 키워드,소재A,100000,50000,1200,80,30,450000\n`
  const { rows, errors } = parseReportCsv(csv)
  assert.deepEqual(errors, [])
  assert.deepEqual(rows, [{
    reportDate: '2026-10-01', media: 'NAVER', campaignName: '가을 세일', adGroupName: '브랜드 키워드',
    creativeName: '소재A', cost: 100000, impressions: 50000, clicks: 1200, carts: 80, conversions: 30, revenue: 450000,
  }])
})

test('엑셀식 값(쉼표 숫자, 따옴표, 슬래시 날짜, 한글 매체명)도 받아준다', () => {
  const csv = `${HEADER}\n2026/10/1,네이버,"가을, 세일",그룹,소재,"100,000",0,0,0,0,"1,000원"\n`
  const { rows, errors } = parseReportCsv(csv)
  assert.deepEqual(errors, [])
  assert.equal(rows[0].reportDate, '2026-10-01')
  assert.equal(rows[0].media, 'NAVER')
  assert.equal(rows[0].campaignName, '가을, 세일')
  assert.equal(rows[0].cost, 100000)
  assert.equal(rows[0].revenue, 1000)
})

test('잘못된 값은 줄 번호와 함께 알려준다', () => {
  const csv = `${HEADER}\n2026-02-30,KAKAO,,그룹,소재,-1,0,0,0,0,abc\n`
  const { errors } = parseReportCsv(csv)
  assert.equal(errors.length, 5)
  assert.ok(errors.every((message) => message.startsWith('2번째 줄')))
})

test('제목 줄에 빠진 칸이 있으면 알려준다', () => {
  const { errors } = parseReportCsv('날짜,매체\n2026-10-01,NAVER\n')
  assert.match(errors[0], /광고그룹/)
})

test('데이터 줄이 없으면 알려준다', () => {
  assert.equal(parseReportCsv(`${HEADER}\n`).errors.length, 1)
})

test('UTF-8 과 엑셀 기본(CP949) 인코딩 모두 한글이 깨지지 않는다', () => {
  const utf8 = new TextEncoder().encode('캠페인')
  assert.equal(decodeCsv(utf8), '캠페인')
  const cp949 = new Uint8Array([0xc4, 0xb7, 0xc6, 0xe4, 0xc0, 0xce]) // '캠페인' in CP949
  assert.equal(decodeCsv(cp949), '캠페인')
})

test('양식 CSV 는 BOM 으로 시작하고 다시 읽으면 칸이 모두 있다', () => {
  const template = buildTemplateCsv()
  assert.equal(template.charCodeAt(0), 0xfeff)
  // BOM 이 붙은 파일(엑셀 "CSV UTF-8" 저장)도 첫 칸 '날짜'를 제대로 읽는다
  const withBom = `${BOM}${HEADER}\n2026-10-01,NAVER,a,b,c,1,1,1,1,1,1\n`
  assert.deepEqual(parseReportCsv(withBom).errors, [])
  assert.match(parseReportCsv(template).errors[0], /데이터 줄이 없어요/)
})
