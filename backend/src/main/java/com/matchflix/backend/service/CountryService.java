package com.matchflix.backend.service;

import com.matchflix.backend.model.Country;
import com.matchflix.backend.repository.CountryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CountryService {
    private final CountryRepository repo;

    public CountryService(CountryRepository repo) {
        this.repo = repo;
    }

    public List<Country> getAll() {
        return repo.findAllSorted();
    }

    public Country getById(Long id) {
        return repo.findById(id).orElse(null);
    }
}
