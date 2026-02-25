// src/utils/formatter.ts

/*
 * 나열해주신 23개 통화 목록에 대한 소수점 처리 정책
 * 원화(KRW), 일본 옌(JPY) 등은 소수점이 없고,
 * 바레인(BHD), 쿠웨이트(KWD) 등은 소수점 3자리를 사용하기도 합니다.
 */
const CURRENCY_DECIMALS: Record<string, number> = {
  KRW: 0,
  JPY: 0,
  KWD: 3,
  BHD: 3, // 디나르 계열은 정밀도가 높음
  // 나머지는 기본적으로 2자리
};

/**
 * 금액을 포맷팅하고 뒤에 통화 코드를 붙여줍니다. (기호 제외)
 * @param value 금액 (숫자 또는 문자열)
 * @param code 통화 코드 (예: 'USD', 'JPY(100)')
 */
export const formatCurrency = (
  value: number | string,
  code: string = "KRW",
): string => {
  if (value === undefined || value === null) return "-";

  const num = typeof value === "string" ? parseFloat(value) : value;

  // 1. 통화 코드 정규화 (JPY(100) -> JPY)
  const cleanCode = code.split("(")[0].toUpperCase();

  // 2. 소수점 자리수 결정
  const fractionDigits = CURRENCY_DECIMALS[cleanCode] ?? 2;

  // 3. 숫자 포맷팅 (천 단위 콤마)
  const formattedValue = new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);

  // 4. 결과 반환 (예: 1,234.56 USD)
  return `${formattedValue} ${cleanCode}`;
};

/* 통화 한글 명칭 반환 (선택 사항) */
export const getCurrencyName = (code: string): string => {
  const names: Record<string, string> = {
    AED: "아랍에미리트 디르함",
    AUD: "호주 달러",
    BHD: "바레인 디나르",
    BND: "브루나이 달러",
    CAD: "캐나다 달러",
    CHF: "스위스 프랑",
    CNH: "위안화",
    DKK: "덴마크 크로네",
    EUR: "유로",
    GBP: "영국 파운드",
    HKD: "홍콩 달러",
    IDR: "인도네시아 루피아",
    JPY: "일본 옌",
    KRW: "한국 원",
    KWD: "쿠웨이트 디나르",
    MYR: "말레이시아 링기트",
    NOK: "노르웨이 크로네",
    NZD: "뉴질랜드 달러",
    SAR: "사우디 리얄",
    SEK: "스웨덴 크로나",
    SGD: "싱가포르 달러",
    THB: "태국 바트",
    USD: "미국 달러",
  };
  const cleanCode = code.split("(")[0].toUpperCase();
  return names[cleanCode] || cleanCode;
};
