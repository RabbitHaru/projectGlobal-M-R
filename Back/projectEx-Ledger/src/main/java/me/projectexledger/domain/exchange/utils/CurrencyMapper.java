package me.projectexledger.domain.exchange.utils;

import java.util.HashMap;
import java.util.Map;

public class CurrencyMapper {
    private static final Map<String, String> CURRENCY_MAP = new HashMap<>();

    static {
        // 공식적으로 지원할 통화 목록
        CURRENCY_MAP.put("USD", "미국 달러");
        CURRENCY_MAP.put("EUR", "유로");
        CURRENCY_MAP.put("JPY", "일본 옌");  // 100단위가 아닌 1단위 기준
        CURRENCY_MAP.put("CNH", "위안화");
        CURRENCY_MAP.put("GBP", "영국 파운드");
        CURRENCY_MAP.put("CHF", "스위스 프랑");
        CURRENCY_MAP.put("CAD", "캐나다 달러");
        CURRENCY_MAP.put("AUD", "호주 달러");
        CURRENCY_MAP.put("HKD", "홍콩 달러");
        CURRENCY_MAP.put("SGD", "싱가포르 달러");
        CURRENCY_MAP.put("IDR", "인도네시아 루피아");
    }

    public static String getName(String unit) {
        return CURRENCY_MAP.getOrDefault(unit.trim(), unit);
    }

    // 🌟 지원하는 통화인지 검증하는 메서드 (Frankfurter 등에서 쓸데없는 국가 필터링 용도)
    public static boolean isSupported(String unit) {
        return CURRENCY_MAP.containsKey(unit.trim());
    }
}