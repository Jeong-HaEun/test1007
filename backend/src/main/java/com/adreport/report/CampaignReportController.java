package com.adreport.report;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
public class CampaignReportController {

    private final CampaignReportRepository repository;

    public CampaignReportController(CampaignReportRepository repository) {
        this.repository = repository;
    }

    /** 목록: 최신 날짜부터 */
    @GetMapping
    public List<CampaignReport> list() {
        return repository.findAll(Sort.by(Sort.Order.desc("reportDate"), Sort.Order.desc("id")));
    }

    /** 추가 */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CampaignReport create(@Valid @RequestBody CampaignReport report) {
        report.setId(null); // id 는 DB가 정한다
        return repository.save(report);
    }

    /**
     * CSV 일괄 등록. 한 줄이라도 검증에 실패하면 전부 저장하지 않는다 (400).
     * 날짜·매체·캠페인·광고그룹·소재가 같은 행이 이미 있으면 숫자를 덮어쓴다.
     */
    @PostMapping("/bulk")
    @Transactional
    public BulkResult bulkUpsert(@RequestBody @NotEmpty List<@Valid CampaignReport> reports) {
        int created = 0;
        int updated = 0;
        for (CampaignReport report : reports) {
            Optional<CampaignReport> existing = repository
                    .findFirstByReportDateAndMediaAndCampaignNameAndAdGroupNameAndCreativeName(
                            report.getReportDate(), report.getMedia(), report.getCampaignName(),
                            report.getAdGroupName(), report.getCreativeName());
            if (existing.isPresent()) {
                report.setId(existing.get().getId());
                updated++;
            } else {
                report.setId(null);
                created++;
            }
            repository.save(report);
        }
        return new BulkResult(created, updated);
    }

    public record BulkResult(int created, int updated) {
    }

    /** 수정 */
    @PutMapping("/{id}")
    public CampaignReport update(@PathVariable Long id, @Valid @RequestBody CampaignReport report) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "report not found: " + id);
        }
        report.setId(id);
        return repository.save(report);
    }

    /** 삭제 */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "report not found: " + id);
        }
        repository.deleteById(id);
    }
}
