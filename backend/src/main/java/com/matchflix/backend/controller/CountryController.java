package com.matchflix.backend.controller;

import com.matchflix.backend.model.Country;
import com.matchflix.backend.service.CountryService;
import com.matchflix.backend.repository.CountryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/countries")
// Geliştirmede React için CORS aç
@CrossOrigin(origins = "http://localhost:3000")
public class CountryController {

    private final CountryService service;

    // Service kullanmak istemezsen parametreyi CountryRepository yapıp service yerine repo çağır.
    public CountryController(CountryService service) {
        this.service = service;
    }

    @GetMapping
    public List<Country> all() {
        return service.getAll(); // veya repo.findAllSorted()
    }

    @GetMapping("/{id}")
    public Country byId(@PathVariable Long id) {
        return service.getById(id);
    }
}
