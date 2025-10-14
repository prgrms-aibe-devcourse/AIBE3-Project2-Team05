package com.back.domain.tech.controller;

import com.back.domain.tech.dto.TechDto;
import com.back.domain.tech.service.TechService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/techs")
public class TechController {
    private final TechService techService;

    @GetMapping
    public List<TechDto> searchAvailableTechs(@RequestParam String keyword) {
        return techService.searchAvailableTechs(keyword);
    }
}
