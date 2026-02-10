package com.smishingprevention.webbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WebReportRequestDto {
    private String reporterUid; // [추가] 신고자 UID
    private String phoneNumber;
    private String url;
    private String bankAccount;
    private String keywords;
    private String description;
}