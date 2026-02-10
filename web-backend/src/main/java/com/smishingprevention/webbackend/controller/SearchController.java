package com.smishingprevention.webbackend.controller;

import com.smishingprevention.webbackend.dto.SearchDto;
import com.smishingprevention.webbackend.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}) // 프론트엔드 주소 허용
public class SearchController {

    private final SearchService searchService;

    @PostMapping
    public ResponseEntity<List<SearchDto.Response>> search(@RequestBody SearchDto.Request request) {
        // 1. 서비스 호출
        SearchDto.Response result = searchService.search(request.getType(), request.getQuery());

        // 2. 결과가 있으면 리스트에 담아서 반환
        if (result != null) {
            return ResponseEntity.ok(Collections.singletonList(result));
        } 
        
        // 3. 결과가 없으면(null이면) 빈 리스트 반환
        return ResponseEntity.ok(Collections.emptyList());
    }
}
