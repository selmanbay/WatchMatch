package com.matchflix.backend.repository;

import com.matchflix.backend.model.Country;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CountryRepository extends JpaRepository<Country, Long> {
    default List<Country> findAllSorted() {
        return findAll(Sort.by(Sort.Direction.ASC, "countryName"));
    }
    boolean existsByCountryNameIgnoreCase(String countryName);
}
