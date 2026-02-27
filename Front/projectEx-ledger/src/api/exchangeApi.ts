import axios from "axios";

/**
 * 백엔드에서 내려오는 환율 데이터 DTO 인터페이스
 */
export interface ExchangeRateResponse {
  id: number;
  curUnit: string; // 통화 코드 (예: USD)
  curNm: string; // 통화명
  rate: number; // 매매 기준율
  provider: string; // 출처
  updatedAt: string; // 고시 시간 (ISO 8601 string)
}

// 개발/운영 환경에 따른 Base URL 설정 (Vite 환경변수 활용 권장)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * 특정 통화의 기간별 환율 내역을 가져옵니다.
 * @param curUnit 통화 코드 (USD, JPY 등)
 * @param days 조회 기간 (일 단위)
 */
export const fetchExchangeRates = async (
  curUnit: string,
  days: number,
): Promise<ExchangeRateResponse[]> => {
  try {
    const response = await axios.get<ExchangeRateResponse[]>(
      `${BASE_URL}/api/v1/exchange/history/${curUnit}`,
      {
        params: { days }, // 쿼리 파라미터로 전달 (?days=30)
      },
    );

    // 데이터 무결성 체크: 정산 시스템이므로 데이터가 비어있을 경우에 대한 로그 남김
    if (!response.data || response.data.length === 0) {
      console.warn(`[API] ${curUnit}에 대한 환율 데이터가 비어있습니다.`);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `[API Error] Status: ${error.response?.status}, Message: ${error.message}`,
      );
    }
    throw error; // 에러를 호출부(Container)로 전파하여 UI 처리를 유도
  }
};
