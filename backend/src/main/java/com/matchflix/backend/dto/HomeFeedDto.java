package com.matchflix.backend.dto;

import java.util.List;

public record HomeFeedDto(
        List<HomeSectionDto> sections
) {}
