package com.smishingprevention.webbackend;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource; // 이거 필수
import jakarta.annotation.PostConstruct; // Spring Boot 3.x 이상

import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() {
        try {
            // 이미 초기화되어 있다면 건너뜀 (중복 실행 방지)
            if (!FirebaseApp.getApps().isEmpty()) {
                return;
            }

            // 1. resources 폴더에 있는 json 파일을 읽어옵니다.
            InputStream serviceAccount = new ClassPathResource("serviceAccountKey.json").getInputStream();

            // 2. 읽어온 키로 옵션을 설정합니다.
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            // 3. 초기화
            FirebaseApp.initializeApp(options);
            System.out.println("✅ Firebase Application Initialized Successfully!");

        } catch (Exception e) {
            e.printStackTrace();
            // 여기서 에러가 나면 서버가 켜지다가 죽습니다.
            throw new RuntimeException("Firebase 초기화 실패: resources 폴더에 serviceAccountKey.json 파일이 있는지 확인하세요.");
        }
    }
}
