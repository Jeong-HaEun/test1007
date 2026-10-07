-- 백엔드 시작 시 자동 실행된다. 테이블이 이미 있으면 아무것도 하지 않는다.
-- 지표(CTR, CPC, CPB, CPA, ROAS)는 저장하지 않는다.
CREATE TABLE IF NOT EXISTS campaign_report (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    report_date   DATE         NOT NULL,
    media         VARCHAR(20)  NOT NULL,
    campaign_name VARCHAR(100) NOT NULL,
    ad_group_name VARCHAR(100) NOT NULL,
    creative_name VARCHAR(100) NOT NULL,
    cost          BIGINT       NOT NULL,
    impressions   BIGINT       NOT NULL,
    clicks        BIGINT       NOT NULL,
    carts         BIGINT       NOT NULL,
    conversions   BIGINT       NOT NULL,
    revenue       BIGINT       NOT NULL,
    PRIMARY KEY (id)
);
