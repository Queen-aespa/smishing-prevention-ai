package com.smishingprevention.webbackend.service;

import com.smishingprevention.webbackend.dto.ReportDetailResponse;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class ReportService {

    public List<ReportDetailResponse> getAllReportsWithUserInfo() throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        List<ReportDetailResponse> responseList = new ArrayList<>();

        // 1. 커뮤니티 리포트 전체 가져오기 (최신순 정렬)
        // 만약 인덱스 에러가 나면 .orderBy 부분을 잠시 지우세요.
        ApiFuture<QuerySnapshot> future = db.collection("community_reports")
                                            .orderBy("timestamp", Query.Direction.DESCENDING)
                                            .get();
        
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        // 2. 각 게시글마다 작성자 정보 조회 (Loop)
        for (QueryDocumentSnapshot document : documents) {
            String reporterUid = document.getString("reporterUid");
            
            // 유저 정보 기본값 (탈퇴했거나 정보가 없을 경우 대비)
            String nickname = "알 수 없음";
            String region = "지역 미설정";
            String age = "알 수 없음";
            String job = "직업 미상";

            // 3. reporterUid가 있으면 Users 컬렉션에서 조회
            if (reporterUid != null && !reporterUid.isEmpty()) {
                DocumentSnapshot userDoc = db.collection("users").document(reporterUid).get().get();
                
                if (userDoc.exists()) {
                    nickname = userDoc.getString("nickname");
                    region = userDoc.getString("region");
                    job = userDoc.getString("job");
                    
                    // 생년월일("20020919") -> 나이("25세") 변환
                    String birthStr = userDoc.getString("birth");
                    age = calculateAge(birthStr);
                }
            }

            // 4. DTO 생성 및 리스트 추가
            ReportDetailResponse dto = ReportDetailResponse.builder()
                    .id(document.getId())
                    .summary(document.getString("summary"))
                    .riskLevel(document.getString("riskLevel"))
                    .timestamp(document.getLong("timestamp")) // Firestore Timestamp는 Long으로 받음
                    .advice(document.getString("advice"))
                    .contextInfo(document.getString("contextInfo"))
                    .imageUrl(document.getString("imageUrl"))
                    // 유저 정보 매핑
                    .reporterNickname(nickname)
                    .reporterRegion(region)
                    .reporterAge(age)
                    .reporterJob(job)
                    .build();

            responseList.add(dto);
        }

        return responseList;
    }

    // 나이 계산 함수 (한국식 나이: 현재연도 - 태어난연도 + 1)
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