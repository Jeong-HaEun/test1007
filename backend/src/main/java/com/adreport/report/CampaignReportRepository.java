package com.adreport.report;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface CampaignReportRepository extends JpaRepository<CampaignReport, Long> {

    /** CSV 업로드 덮어쓰기 기준: 날짜 + 매체 + 캠페인 + 광고그룹 + 소재 */
    Optional<CampaignReport> findFirstByReportDateAndMediaAndCampaignNameAndAdGroupNameAndCreativeName(
            LocalDate reportDate,
            CampaignReport.Media media,
            String campaignName,
            String adGroupName,
            String creativeName);
}
