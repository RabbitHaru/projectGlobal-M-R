package me.projectexledger.common.util;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 정산을 위한 날짜 계산 유틸리티
 */
public class DateUtils {

    public static LocalDate getToday() {
        return LocalDate.now();
    }

    public static LocalDateTime getStartOfDay(LocalDate date) {
        return date.atStartOfDay();
    }

    public static LocalDateTime getEndOfDay(LocalDate date) {
        return date.atTime(23, 59, 59);
    }
}
