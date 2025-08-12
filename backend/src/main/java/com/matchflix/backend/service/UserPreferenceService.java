package com.matchflix.backend.service;

import com.matchflix.backend.model.User;
import com.matchflix.backend.model.UserPreference;
import com.matchflix.backend.repository.UserPreferenceRepository;
import com.matchflix.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class UserPreferenceService {

    private final UserPreferenceRepository prefRepo;
    private final UserRepository userRepo;
    private final UserPreferenceRepository userPreferenceRepository;

    public UserPreferenceService(UserPreferenceRepository prefRepo,
                                 UserRepository userRepo, UserPreferenceRepository userPreferenceRepository) {
        this.prefRepo = prefRepo;
        this.userRepo = userRepo;
        this.userPreferenceRepository = userPreferenceRepository;
    }

    public UserPreference createForUser(Long userId, String sex, String language) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserPreference p = new UserPreference();
        p.setUser(user);          // ÖNEMLİ: @OneToOne user_id dolsun
        p.setSex(sex);
        p.setLanguage(language);
        return userPreferenceRepository.save(p);
    }

    // sex ve language basit örnek; istersen alan ekleyebilirsin
    public UserPreference createOrUpdateForUser(Long userId, String sex, String language) {
        if (userId == null) throw new IllegalArgumentException("userId zorunlu.");
        if (sex == null || sex.isBlank()) sex = "-";
        if (language == null || language.isBlank()) language = "-";

        // user var mı?
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userId));

        try {
            // daha önce varsa güncelle, yoksa oluştur
            UserPreference pref = prefRepo.findByUserId(userId).orElse(null);
            if (pref == null) {
                pref = new UserPreference();
                pref.setUser(user); // ilişkiyi kuran taraf
            }
            pref.setSex(sex);
            pref.setLanguage(language);

            return prefRepo.save(pref);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Tercih kaydı başarısız: " + e.getMostSpecificCause().getMessage(), e);
        }
    }
}
