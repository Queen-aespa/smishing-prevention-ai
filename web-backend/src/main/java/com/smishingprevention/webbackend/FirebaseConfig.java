package com.smishingprevention.webbackend;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource; // 이거 필수
import jakarta.annotation.PostConstruct; // Spring Boot 3.x 이상

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() {
        try {
            // 로컬 개발 등에서 Firebase 비활성화
            String disabled = System.getenv("FIREBASE_DISABLED");
            if (disabled != null && disabled.equalsIgnoreCase("true")) {
                System.out.println("ℹ️ Firebase initialization skipped (FIREBASE_DISABLED=true)");
                return;
            }

            // 이미 초기화되어 있다면 건너뜀 (중복 실행 방지)
            if (!FirebaseApp.getApps().isEmpty()) {
                return;
            }

            // 1. 환경변수 경로 우선, 없으면 resources의 json 파일 사용
            String credentialsPath = System.getenv("FIREBASE_CREDENTIALS_PATH");
            try (InputStream serviceAccount = (credentialsPath != null && !credentialsPath.isBlank())
                    ? new FileInputStream(credentialsPath)
                    : new ClassPathResource("serviceAccountKey.json").getInputStream()) {

                // 2. 읽어온 키로 옵션을 설정합니다.
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                // 3. 초기화
                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase Application Initialized Successfully!");
            }

        } catch (FileNotFoundException e) {
            System.err.println("⚠️ Firebase initialization skipped: credential file not found.");
            System.err.println("   Set FIREBASE_CREDENTIALS_PATH or add serviceAccountKey.json to resources.");
        } catch (IOException e) {
            System.err.println("⚠️ Firebase initialization skipped due to I/O error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Firebase initialization failed.", e);
        }
    }
}
