package com.matchflix.backend.dto;

public class UserDto {
    private Long id;
    private String email;
    private String username;
    private String firstName;
    private String lastName;

    // Opsiyonel: ülke bilgilerini sadece id+isim olarak veriyoruz
    private Long countryId;
    private String countryName;

    // Opsiyonel: profil resmi alanın varsa
    private String ppLink;

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
    public String getPpLink() { return ppLink; }
    public void setPpLink(String ppLink) { this.ppLink = ppLink; }
}
