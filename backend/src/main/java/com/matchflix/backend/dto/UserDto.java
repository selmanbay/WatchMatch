package com.matchflix.backend.dto;

/**
 * User DTO sent to the frontend.
 * NOTE:
 *  - Preferred avatar field is {@code avatarUrl}.
 *  - {@code ppLink} is kept for backward compatibility with older clients.
 *    Setters keep both fields in sync so mappers can use either one.
 */
public class UserDto {
    private Long id;
    private String email;
    private String username;
    private String firstName;
    private String lastName;

    // Country (flattened)
    private Long countryId;
    private String countryName;

    // Avatar
    private String avatarUrl; // preferred name
    private String ppLink;    // legacy alias

    public UserDto() {}

    // --- getters / setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public Long getCountryId() { return countryId; }
    public void setCountryId(Long countryId) { this.countryId = countryId; }

    public String getCountryName() { return countryName; }
    public void setCountryName(String countryName) { this.countryName = countryName; }

    public String getAvatarUrl() { return avatarUrl; }
    /** Setting avatarUrl also updates ppLink for backward compatibility. */
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
        this.ppLink = avatarUrl;
    }

    public String getPpLink() { return ppLink; }
    /** Setting ppLink also updates avatarUrl for backward compatibility. */
    public void setPpLink(String ppLink) {
        this.ppLink = ppLink;
        this.avatarUrl = ppLink;
    }
}
