package com.adreport.report;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;

/**
 * campaign_report 테이블 한 행.
 * 원본 숫자만 저장한다. CTR·CPC·CPB·CPA·ROAS 는 프론트엔드에서 계산한다.
 */
@Entity
@Table(name = "campaign_report")
public class CampaignReport {

    public enum Media { NAVER, META, GOOGLE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR) // MySQL ENUM 대신 VARCHAR(20) 으로 저장
    @Column(nullable = false, length = 20)
    private Media media;

    @NotBlank
    @Size(max = 100)
    @Column(name = "campaign_name", nullable = false, length = 100)
    private String campaignName;

    @NotBlank
    @Size(max = 100)
    @Column(name = "ad_group_name", nullable = false, length = 100)
    private String adGroupName;

    @NotBlank
    @Size(max = 100)
    @Column(name = "creative_name", nullable = false, length = 100)
    private String creativeName;

    @NotNull @PositiveOrZero
    @Column(nullable = false)
    private Long cost;

    @NotNull @PositiveOrZero
    @Column(nullable = false)
    private Long impressions;

    @NotNull @PositiveOrZero
    @Column(nullable = false)
    private Long clicks;

    @NotNull @PositiveOrZero
    @Column(nullable = false)
    private Long carts;

    @NotNull @PositiveOrZero
    @Column(nullable = false)
    private Long conversions;

    @NotNull @PositiveOrZero
    @Column(nullable = false)
    private Long revenue;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getReportDate() { return reportDate; }
    public void setReportDate(LocalDate reportDate) { this.reportDate = reportDate; }

    public Media getMedia() { return media; }
    public void setMedia(Media media) { this.media = media; }

    public String getCampaignName() { return campaignName; }
    public void setCampaignName(String campaignName) { this.campaignName = campaignName; }

    public String getAdGroupName() { return adGroupName; }
    public void setAdGroupName(String adGroupName) { this.adGroupName = adGroupName; }

    public String getCreativeName() { return creativeName; }
    public void setCreativeName(String creativeName) { this.creativeName = creativeName; }

    public Long getCost() { return cost; }
    public void setCost(Long cost) { this.cost = cost; }

    public Long getImpressions() { return impressions; }
    public void setImpressions(Long impressions) { this.impressions = impressions; }

    public Long getClicks() { return clicks; }
    public void setClicks(Long clicks) { this.clicks = clicks; }

    public Long getCarts() { return carts; }
    public void setCarts(Long carts) { this.carts = carts; }

    public Long getConversions() { return conversions; }
    public void setConversions(Long conversions) { this.conversions = conversions; }

    public Long getRevenue() { return revenue; }
    public void setRevenue(Long revenue) { this.revenue = revenue; }
}
