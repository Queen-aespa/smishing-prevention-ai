package com.smishingprevention.webbackend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReportDetailResponse {
    // 1. 게시글 정보
    private String id;
    private String summary;
    private String riskLevel;
    private long timestamp;
    private String advice;
    private String contextInfo;
    private String imageUrl;

    // 2. 작성자 정보 (Join 된 데이터)
    private String reporterNickname; // 프론트에서 안 쓰더라도 에러 방지용 포함
    private String reporterRegion;
    private String reporterAge;      // 예: "24세"
    private String reporterJob;
}
