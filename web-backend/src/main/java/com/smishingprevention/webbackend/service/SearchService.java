package com.smishingprevention.webbackend.service;

import com.smishingprevention.webbackend.dto.SearchDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Map;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class SearchService {

    @Value("${apick.api.url}")
    private String apickUrl;

    @Value("${apick.api.key}")
    private String apickKey;

    public SearchDto.Response search(String type, String query) {
        if ("phone".equals(type)) {
            return checkPhoneNumber(query);
        }
        return null;
    }

    private SearchDto.Response checkPhoneNumber(String phoneNumber) {
        // 1. 하이픈(-) 제거 (문서 예시에 01012341234로 되어있음)
        String cleanNumber = phoneNumber.replaceAll("-", "").trim();

        // [테스트 모드] 0000 입력 시 강제 스팸 처리
        if (cleanNumber.endsWith("0000")) {
            return SearchDto.Response.builder()
                    .id(UUID.randomUUID().toString())
                    .phone(phoneNumber)
                    .description("[테스트] 보이스피싱 (신고: 999+)")
                    .reportDate(LocalDate.now().toString())
                    .isSpam(true)
                    .build();
        }

        RestTemplate restTemplate = new RestTemplate();

        // 2. 헤더 설정 (CL_AUTH_KEY 및 Form Data 타입)
        HttpHeaders headers = new HttpHeaders();
        headers.set("CL_AUTH_KEY", apickKey);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // 3. 바디 설정 (FormData: number=010...)
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("number", cleanNumber);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            // [로그] 요청 내용 확인
            System.out.println(">> [Backend Request] URL: " + apickUrl);
            System.out.println(">> [Backend Request] Number: " + cleanNumber);

            // 4. POST 요청 전송
            ResponseEntity<Map> response = restTemplate.postForEntity(apickUrl, request, Map.class);
            Map<String, Object> body = response.getBody();

            // [로그] 응답 내용 확인
            System.out.println(">> [Backend Response] Body: " + body);

            // 5. 응답 파싱 (문서 구조에 맞춤)
            // 구조: { "data": { "spam": "보이스피싱", "spam_count": "1000+", ... }, "api": {...} }
            if (body != null && body.containsKey("data")) {
                Map<String, Object> data = (Map<String, Object>) body.get("data");

                if (data != null) {
                    // spam 필드 확인
                    Object spamType = data.get("spam");       // 예: "보이스피싱"
                    Object spamCount = data.get("spam_count"); // 예: "1000+"
                    Object registDate = data.get("registed_date"); // 등록일

                    // spam 필드에 내용이 있으면 '위험'으로 판단
                    if (spamType != null && !spamType.toString().isEmpty()) {
                        String description = String.format("유형: %s (신고: %s건)", spamType, spamCount);
                        String reportDate = (registDate != null) ? registDate.toString() : LocalDate.now().toString();

                        return SearchDto.Response.builder()
                                .id(UUID.randomUUID().toString())
                                .phone(phoneNumber)
                                .description(description)
                                .reportDate(reportDate)
                                .isSpam(true)
                                .build();
                    }
                }
            }

        } catch (Exception e) {
            System.out.println(">> [Backend Error]");
            e.printStackTrace();
        }

        return null; // 스팸 아님 (안전)
    }
}