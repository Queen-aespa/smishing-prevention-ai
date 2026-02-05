package com.smishingprevention.webbackend.controller;

import com.smishingprevention.webbackend.dto.ReportDetailResponse;
import com.smishingprevention.webbackend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports") // 이 주소로 호출됨
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // 리액트(5173) 접근 허용
public class ReportController {

    private final ReportService reportService;

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
}
