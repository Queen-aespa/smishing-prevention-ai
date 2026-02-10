package com.smishingprevention.webbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    // [수정 1] URL에서 '?key=' 제거 (순수 엔드포인트만 남김)
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

    private final HttpClient httpClient;

    public GeminiService() {
        this.httpClient = HttpClient.newHttpClient();
    }

    public Map<String, Object> analyzeImage(MultipartFile file) {
        try {
            System.out.println("========== [Gemini] 분석 요청 시작 ==========");
            
            // 1. 이미지 Base64 인코딩
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());

            // 2. 요청 바디 생성
            String requestJson = buildJsonRequest(base64Image);
            
            // 3. [수정 2] 헤더에 API 키 추가 (이 방식이 더 안전함)
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GEMINI_URL)) // URL에는 키 없음
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", geminiApiKey) // [핵심] 헤더로 키 전송
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("========== [Gemini] 응답 코드: " + response.statusCode() + " ==========");

            if (response.statusCode() != 200) {
                System.err.println("!!! [Gemini] 요청 실패 !!!");
                System.err.println("에러 본문: " + response.body());
                return new HashMap<>();
            }

            // 4. 응답 파싱
            return parseGeminiResponse(response.body());

        } catch (Exception e) {
            e.printStackTrace();
            return new HashMap<>();
        }
    }

    // JSON 요청 생성
    private String buildJsonRequest(String base64Image) {
        String prompt = getPromptText()
                .replace("\\", "\\\\") 
                .replace("\"", "\\\"") 
                .replace("\n", "\\n");

        return """
            {
              "contents": [{
                "parts": [
                  {"text": "%s"},
                  {"inline_data": {
                    "mime_type": "image/jpeg",
                    "data": "%s"
                  }}
                ]
              }]
            }
            """.formatted(prompt, base64Image);
    }

    // 응답 파싱
    private Map<String, Object> parseGeminiResponse(String responseBody) {
        Map<String, Object> result = new HashMap<>();
        try {
            int candidatesIndex = responseBody.indexOf("\"candidates\"");
            if (candidatesIndex == -1) return result;

            int textLabelIndex = responseBody.indexOf("\"text\": \"", candidatesIndex);
            if (textLabelIndex == -1) return result;
            
            int startQuote = textLabelIndex + 9;
            int endQuote = startQuote;
            while (true) {
                endQuote = responseBody.indexOf("\"", endQuote + 1);
                if (endQuote == -1) break;
                if (responseBody.charAt(endQuote - 1) != '\\') break;
            }

            if (endQuote == -1) return result;

            String rawJsonText = responseBody.substring(startQuote, endQuote);
            String cleanJson = rawJsonText
                    .replace("\\n", "\n")
                    .replace("\\\"", "\"")
                    .replace("\\r", "")
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            System.out.println("========== [Gemini] 파싱된 JSON ==========");
            System.out.println(cleanJson);

            result.put("risk_level", extractValue(cleanJson, "risk_level"));
            result.put("archetype", extractValue(cleanJson, "archetype"));
            result.put("action", extractValue(cleanJson, "action"));
            result.put("summary", extractValue(cleanJson, "summary"));
            result.put("advice", extractList(cleanJson, "advice"));
            result.put("risk_factors", extractList(cleanJson, "risk_factors"));

        } catch (Exception e) {
            System.err.println("[Gemini] 파싱 에러: " + e.getMessage());
        }
        return result;
    }

    private String extractValue(String json, String key) {
        Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*\"(.*?)\"");
        Matcher matcher = pattern.matcher(json);
        return matcher.find() ? matcher.group(1) : "";
    }

    private List<String> extractList(String json, String key) {
        List<String> list = new ArrayList<>();
        Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*\\[(.*?)\\]", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            Matcher itemMatcher = Pattern.compile("\"(.*?)\"").matcher(matcher.group(1));
            while (itemMatcher.find()) list.add(itemMatcher.group(1));
        }
        return list;
    }

    private String getPromptText() {
        return """
            Analyze this screenshot for phishing, smishing, and scams.
            Read the [REFERENCE GUIDELINES] above carefully and classify the message.

            [REFERENCE GUIDELINES - Use these to classify 'archetype', 'risk_level', and 'action']

            (A) AUTHORITY_IMPERSONATION (기관·공식 사칭)
            - Context: 검찰/금융기관 사칭 → 사건 연루/계좌 보호 → 안전계좌 이체 유도.
            - Essential Signals: 기관 사칭, 사건번호/법적 절차 언급, 시간 압박, 송금 요구.
            - Risk: STOP_IMMEDIATELY.

            (B) ACQUAINTANCE_IMPERSONATION (지인·가족 사칭)
            - Context: 자녀/친구 사칭 → 폰 고장/분실 → 급전 또는 인증 대행 요구.
            - Essential Signals: 가족/지인 호칭, 금전 요구.
            - Risk: WARNING.

            (C) LINK_APP_INDUCTION (링크·앱 유도)
            - Context: 택배/지원금 문자 → 링크 클릭 → 악성 앱 설치.
            - Essential Signals: URL 포함, APK 설치 유도.
            - Risk: WARNING.

            (D) INVESTMENT_SCAM (투자·부업 유혹)
            - Context: 고수익 보장 → 투자금 입금 요구.
            - Risk: WARNING or STOP_IMMEDIATELY.

            (E) RELATIONSHIP_SCAM (로맨스 스캠)
            - Context: 장기간 대화 → 금전 요구.
            - Risk: WARNING.

            (F) THREAT_SCAM (협박·갈취)
            - Context: 몸캠/개인정보 유출 협박 → 합의금 요구.
            - Risk: STOP_IMMEDIATELY.

            [OUTPUT REQUIREMENTS]
            Based on the analysis, return ONLY a JSON object.
            
            1. archetype (Select ONE): AUTHORITY_IMPERSONATION, ACQUAINTANCE_IMPERSONATION, LINK_APP_INDUCTION, INVESTMENT_SCAM, RELATIONSHIP_SCAM, THREAT_SCAM, NORMAL
            2. risk_level (Select ONE): SAFE, CAUTION, WARNING, STOP_IMMEDIATELY
            3. action (Select ONE): MONEY_TRANSFER, INSTALL_APP, CLICK_LINK, SHARE_AUTH_CODE, SHARE_PERSONAL_INFO, REMOTE_CONTROL, BUY_GIFT_CARD, KEEP_CALL, NONE

            JSON Structure (Korean):
            {
              "risk_level": "Enum",
              "archetype": "Enum",
              "action": "Enum",
              "summary": "1-2 sentence summary in Korean",
              "risk_factors": ["Factor 1", "Factor 2"],
              "platform": "App Name",
              "counterpart_name": "Sender Name",
              "advice": ["Advice 1", "Advice 2"],
              "phone_numbers": ["010-xxxx-xxxx"],
              "urls": ["http://..."]
            }
        """;
    }
}