package me.projectexledger.domain.client.dto;

import java.time.LocalDateTime;

public record ClientPendingDTO(
        Long clientId,
        String companyName,
        String businessRegistrationNumber,
        String contactEmail,
        LocalDateTime requestedAt
) {}