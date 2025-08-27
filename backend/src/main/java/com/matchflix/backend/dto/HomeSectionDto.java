package com.matchflix.backend.dto;

import com.matchflix.backend.dto.MovieDto;
import java.util.List;

public record HomeSectionDto(
        String key,    // "for_you", "from_wishlist", "popular", "new_releases"
        String title,  // UI başlığı
        List<MovieDto> items
) {}
