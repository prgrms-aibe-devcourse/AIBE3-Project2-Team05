package com.back.domain.freelancer.career.service;

import com.back.domain.freelancer.career.dto.CareerRequestDto;
import com.back.domain.freelancer.career.dto.CareerResponseDto;
import com.back.domain.freelancer.career.entity.Career;
import com.back.domain.freelancer.career.repository.CareerRepository;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CareerService {
    private final CareerRepository careerRepository;

    @Transactional(readOnly = true)
    public List<CareerResponseDto> getCareers(Freelancer freelancer) {
        List<Career> careers = careerRepository.findAllByFreelancer(freelancer);

        return careers.stream()
                .map(CareerResponseDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public CareerResponseDto getCareer(long id) {
        Career career = careerRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));

        return new CareerResponseDto(career);
    }

    @Transactional
    public long create(Freelancer freelancer, CareerRequestDto dto) {
        Career career = new Career(freelancer, dto.company(), dto.position(), dto.startDate(), dto.endDate(), dto.current(), dto.description());
        careerRepository.save(career);
        return career.getId();
    }

    @Transactional
    public long update(Long id, CareerRequestDto dto) {
        Career career = careerRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));
        career.update(dto);
        return career.getId();
    }

    @Transactional
    public long delete(long id) {
        Career career = careerRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));
        careerRepository.delete(career);
        return career.getId();
    }
}
