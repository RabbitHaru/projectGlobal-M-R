package me.projectexledger.domain.auth.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/file")
@RequiredArgsConstructor
public class FileUploadController {

    @Value("${app.upload.dir:${user.home}/.exledger/uploads}")
    private String uploadDir;

    @PostMapping("/upload-license")
    public ResponseEntity<Map<String, String>> uploadLicense(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        try {
            // 디렉토리 생성
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 원본 파일명 (로그용)
            String originalFilename = file.getOriginalFilename();
            // 확장자 추출
            String extension = "";
            if (originalFilename != null && originalFilename.lastIndexOf(".") > 0) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // UUID 기반의 비가역적 랜덤 파일명 생성
            String uuidFileName = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(uuidFileName);

            // 파일 저장 (서버 내부 경로에 비공개 저장)
            file.transferTo(filePath.toFile());

            log.info("사업자 등록증 업로드 완료 - 원본: {}, 저장된 UUID: {}", originalFilename, uuidFileName);

            // 클라이언트에게는 난독화된 UUID 파일명만 반환
            Map<String, String> response = new HashMap<>();
            response.put("uuid", uuidFileName);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("파일 업로드 실패", e);
            throw new RuntimeException("파일 저장 중 오류가 발생했습니다.");
        }
    }
}
