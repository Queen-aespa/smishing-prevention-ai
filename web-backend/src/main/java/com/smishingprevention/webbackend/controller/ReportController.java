package com.smishingprevention.webbackend.controller;

import com.smishingprevention.webbackend.dto.ReportDetailResponse;
import com.smishingprevention.webbackend.dto.WebReportRequestDto; // DTO 임포트 필요
import com.smishingprevention.webbackend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reports") 
@RequiredArgsConstructor
@CrossOrigin(
        origins = {"http://localhost:3000", "http://127.0.0.1:3000"},
        originPatterns = {"https://*.vercel.app"}
) // 프론트엔드 주소 허용
public class ReportController {

    private final ReportService reportService;

    // [기존 코드] 커뮤니티 리포트 조회
    @GetMapping
    public ResponseEntity<List<ReportDetailResponse>> getCommunityReports() {
        try {
            List<ReportDetailResponse> reports = reportService.getAllReportsWithUserInfo();
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // [추가된 코드] 웹 신고 접수 (이미지 + 데이터)
    // 호출 주소: POST http://localhost:8080/api/reports/web
    @PostMapping(value = "/web", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<String> createWebReport(
            // 프론트에서 formData.append("data", jsonBlob)으로 보낸 JSON 데이터
            @RequestPart("data") WebReportRequestDto requestDto,
            // 프론트에서 formData.append("files", file)로 보낸 이미지 파일들 (없을 수도 있음)
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        try {
            // 서비스로 넘겨서 처리 (Firestore 저장 + Storage 업로드)
            String reportId = reportService.createWebReport(requestDto, files);
            return ResponseEntity.ok(reportId);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("신고 접수 실패: " + e.getMessage());
        }
    }
}
