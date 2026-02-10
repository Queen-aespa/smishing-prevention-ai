package com.smishingprevention.webbackend.service;

import com.smishingprevention.webbackend.dto.ReportDetailResponse;
import com.smishingprevention.webbackend.dto.WebReportRequestDto;
import com.google.api.core.ApiFuture;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final GeminiService geminiService;

    private static final String COLLECTION_WEB = "web_reports";
    private static final String COLLECTION_APP = "community_reports";
    private static final String STORAGE_FOLDER = "web_reports_images/";

    /**
     * [수정됨] 커뮤니티 리포트 + 웹 리포트 통합 조회 (최신순 정렬)
     */
    public List<ReportDetailResponse> getAllReportsWithUserInfo() throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        List<ReportDetailResponse> responseList = new ArrayList<>();

        // 1. 두 컬렉션 동시에 비동기 조회 (속도 향상)
        // 앱 신고 내역
        ApiFuture<QuerySnapshot> appFuture = db.collection(COLLECTION_APP).get();
        // 웹 신고 내역
        ApiFuture<QuerySnapshot> webFuture = db.collection(COLLECTION_WEB).get();

        // 2. 결과 가져오기
        List<QueryDocumentSnapshot> appDocs = appFuture.get().getDocuments();
        List<QueryDocumentSnapshot> webDocs = webFuture.get().getDocuments();

        // 3. 앱 신고 데이터 변환 및 추가
        for (QueryDocumentSnapshot doc : appDocs) {
            responseList.add(convertDocumentToDto(db, doc));
        }

        // 4. 웹 신고 데이터 변환 및 추가
        for (QueryDocumentSnapshot doc : webDocs) {
            responseList.add(convertDocumentToDto(db, doc));
        }

        // 5. [중요] 타임스탬프 기준 내림차순 정렬 (최신글이 위로)
        responseList.sort((r1, r2) -> Long.compare(r2.getTimestamp(), r1.getTimestamp()));

        return responseList;
    }

    /**
     * [Helper] Firestore 문서를 DTO로 변환하는 공통 메서드
     */
    private ReportDetailResponse convertDocumentToDto(Firestore db, QueryDocumentSnapshot document) {
        String reporterUid = document.getString("reporterUid");
        
        String nickname = "알 수 없음";
        String region = "지역 미설정";
        String age = "알 수 없음";
        String job = "직업 미상";

        // 사용자 정보 조회 (예외 발생해도 게시글은 보이도록 try-catch)
        if (reporterUid != null && !reporterUid.isEmpty()) {
            try {
                DocumentSnapshot userDoc = db.collection("users").document(reporterUid).get().get();
                if (userDoc.exists()) {
                    nickname = userDoc.getString("nickname");
                    region = userDoc.getString("region");
                    job = userDoc.getString("job");
                    age = calculateAge(userDoc.getString("birth"));
                }
            } catch (Exception e) {
                // 유저 정보 조회 실패 시 기본값 유지
                System.err.println("유저 정보 조회 실패 (" + reporterUid + "): " + e.getMessage());
            }
        }

        return ReportDetailResponse.builder()
                .id(document.getId())
                .summary(document.getString("summary"))
                .riskLevel(document.getString("riskLevel"))
                .timestamp(document.getLong("timestamp"))
                .advice(document.getString("advice"))
                .contextInfo(document.getString("contextInfo"))
                .imageUrl(document.getString("imageUrl"))
                // DTO에 정의된 필드에 맞춰 DB 값 매핑 (없는 필드는 null 처리됨)
                .reporterNickname(nickname)
                .reporterRegion(region)
                .reporterAge(age)
                .reporterJob(job)
                .build();
    }

    /**
     * [신규 기능] 웹 신고 접수
     */
    public String createWebReport(WebReportRequestDto dto, List<MultipartFile> files) {
        Firestore db = FirestoreClient.getFirestore();

        try {
            DocumentReference docRef = db.collection(COLLECTION_WEB).document();
            String docId = docRef.getId();

            String mainImageUrl = "";
            Map<String, Object> aiResult = new HashMap<>();
            String userFolder = (dto.getReporterUid() != null && !dto.getReporterUid().isEmpty()) 
                                ? dto.getReporterUid() : "anonymous";

            if (files != null && !files.isEmpty()) {
                MultipartFile file = files.get(0);
                if (!file.isEmpty()) {
                    Bucket bucket = StorageClient.getInstance().bucket();
                    String blobName = STORAGE_FOLDER + userFolder + "/" + file.getOriginalFilename();

                    bucket.create(blobName, file.getBytes(), file.getContentType());
                    
                    mainImageUrl = "https://firebasestorage.googleapis.com/v0/b/" + bucket.getName() + "/o/"
                            + blobName.replace("/", "%2F") + "?alt=media";

                    aiResult = geminiService.analyzeImage(file);
                }
            }

            Map<String, Object> data = new HashMap<>();
            data.put("id", docId);
            data.put("reporterUid", dto.getReporterUid());
            data.put("timestamp", System.currentTimeMillis());
            data.put("platform", "web");
            data.put("status", "analyzed");

            data.put("riskLevel", aiResult.getOrDefault("risk_level", "PENDING"));
            data.put("archetype", aiResult.getOrDefault("archetype", "UNKNOWN"));
            data.put("action", aiResult.getOrDefault("action", "NONE"));
            data.put("summary", aiResult.getOrDefault("summary", "분석 대기 중입니다."));
            data.put("advice", formatListToString(aiResult.get("advice")));
            data.put("riskFactors", formatListToString(aiResult.get("risk_factors")));

            String contextInfo = String.format("📱 앱: 웹 신고 👤 상대: %s", dto.getPhoneNumber());
            data.put("contextInfo", contextInfo);

            String urlInfo = (dto.getUrl() != null && !dto.getUrl().isEmpty()) ? dto.getUrl() : "없음";
            String phoneReport = String.format("✅ %s : (정보없음) 🔗 URL: %s", dto.getPhoneNumber(), urlInfo);
            data.put("phoneReport", phoneReport);

            data.put("imageUrl", mainImageUrl);
            data.put("urlPreviewUrl", "");

            docRef.set(data).get();

            return docId;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("신고 저장 실패: " + e.getMessage());
        }
    }

    private String formatListToString(Object listObj) {
        if (listObj instanceof List<?>) {
            List<?> list = (List<?>) listObj;
            if (list.isEmpty()) return "";
            return list.stream()
                    .map(Object::toString)
                    .map(s -> "• " + s)
                    .collect(Collectors.joining(" "));
        }
        return "";
    }

    private String calculateAge(String birthStr) {
        if (birthStr == null || birthStr.length() != 8) return "알 수 없음";
        try {
            int birthYear = Integer.parseInt(birthStr.substring(0, 4));
            int currentYear = LocalDate.now().getYear();
            return (currentYear - birthYear + 1) + "세";
        } catch (Exception e) {
            return "알 수 없음";
        }
    }
}