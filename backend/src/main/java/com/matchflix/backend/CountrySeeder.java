// src/main/java/com/matchflix/backend/bootstrap/CountrySeeder.java
package com.matchflix.backend;

import com.matchflix.backend.model.Country;
import com.matchflix.backend.repository.CountryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Configuration
public class CountrySeeder {

    private static final Logger log = LoggerFactory.getLogger(CountrySeeder.class);

    @Bean
    @Transactional
    public ApplicationRunner seedCountries(CountryRepository countryRepository) {
        return args -> {
            Locale displayLocale = new Locale("tr", "TR");
            String[] isoCountries = Locale.getISOCountries();

            List<Country> toInsert = new ArrayList<>();

            for (String code : isoCountries) {
                Locale countryLocale = new Locale("", code);
                String name = countryLocale.getDisplayCountry(displayLocale).trim();
                if (name.isEmpty()) continue;

                // Zaten varsa atla
                if (countryRepository.existsByCountryNameIgnoreCase(name)) continue;

                Country c = new Country();
                c.setCountryName(name);
                // city NOT NULL ise placeholder:
                c.setCity("-");
                toInsert.add(c);
            }

            if (toInsert.isEmpty()) {
                log.info("Country seed: eklenecek yeni ülke yok.");
                return;
            }

            countryRepository.saveAll(toInsert);
            log.info("Country seed tamamlandı. Eklenen ülke sayısı: {}", toInsert.size());
        };
    }
}
