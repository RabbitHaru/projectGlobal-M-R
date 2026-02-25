package me.projectexledger.common.util;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Date calculation utilities for settlements
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
