package com.smishingprevention.webbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class SearchDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String type;  // "phone", "url" 등
        private String query; // 검색할 전화번호
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String phone;
        private String description;
        private String reportDate;
        private boolean isSpam; // 스팸 여부
    }
}