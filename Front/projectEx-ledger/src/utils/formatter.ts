// src/utils/formatter.ts

/**
 * 1. 일반 입력창 숫자 포맷팅 (콤마 추가)
 * 사용자가 계산기에 "1234567"을 치면 "1,234,567"로 예쁘게 바꿔줍니다.
 */
export const formatInputNumber = (value: number | string): string => {
  if (value === undefined || value === null || value === "") return "";

  const stringValue = String(value).replace(/,/g, "");
  const numericValue = parseFloat(stringValue);

  if (isNaN(numericValue)) return "";

  return new Intl.NumberFormat("ko-KR").format(numericValue);
};

/**
 * 2. 최종 환전 금액 포맷팅 (통화 기호 + 소수점 2자리)
 * 환전 결과창에 표시될 때 씁니다. (예: $1,500.50 / ₩1,500)
 */
export const formatCurrencyAmount = (
  amount: number,
  currencyCode: string = "KRW",
): string => {
  // 한국 원(KRW), 일본 엔(JPY)은 소수점이 없으므로 예외 처리
  const isNoDecimal = ["KRW", "JPY"].includes(currencyCode.toUpperCase());

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    minimumFractionDigits: isNoDecimal ? 0 : 2,
    maximumFractionDigits: isNoDecimal ? 0 : 2,
  }).format(amount);
};

/**
 * 3. 🎯 환율표 전용 정밀 포맷팅 (소수점 2~4자리 유지)
 * ExchangeRateTable에서 1.093 달러 같은 미세한 환율을 표시할 때 씁니다.
 * 예: 1350.5 -> "1,350.50" / 1.093 -> "1.0930"
 */
export const formatExchangeRate = (rate: number): string => {
  if (isNaN(rate)) return "0.00";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4, // 환율은 소수점 4자리까지 보여주는 것이 금융권 표준입니다.
  }).format(rate);
};

/**
 * 4. 포맷팅 제거 (계산용 순수 숫자 추출)
 * 화면에 있는 "1,500.50"을 환율 계산 공식에 넣기 위해 1500.5로 되돌립니다.
 */
export const parseToNumber = (value: string): number => {
  if (!value) return 0;
  // 숫자와 소수점(.) 마이너스(-)만 남기고 다 날림
  const unformatted = value.replace(/[^0-9.-]+/g, "");
  return parseFloat(unformatted) || 0;
};
