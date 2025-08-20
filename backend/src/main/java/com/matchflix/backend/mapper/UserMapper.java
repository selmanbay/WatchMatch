package com.matchflix.backend.mapper;

import com.matchflix.backend.dto.UserDto;
import com.matchflix.backend.model.User;

public final class UserMapper {
    private UserMapper() {}

    public static UserDto toDto(User u) {
        if (u == null) return null;

        UserDto d = new UserDto();
        d.setId(u.getId());
        d.setEmail(u.getEmail());
        d.setUsername(u.getUsername());
        d.setFirstName(u.getFirstName());
        d.setLastName(u.getLastName());

        // Avatar (entity alanı: pp_link). DTO setter'ı ppLink ve avatarUrl'i senkronlar.
        d.setAvatarUrl(u.getPp_link());

        if (u.getCountry() != null) {
            d.setCountryId(u.getCountry().getId());
            d.setCountryName(u.getCountry().getCountryName());
        }
        return d;
    }
}
