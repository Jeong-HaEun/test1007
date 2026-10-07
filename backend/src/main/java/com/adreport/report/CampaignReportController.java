package com.adreport.report;

import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
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
