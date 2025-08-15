// com.matchflix.backend.dto.RegisterRequest.java
package com.matchflix.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @Email @NotBlank
    private String email;

    @Size(min = 6, message = "Şifre en az 6 karakter olmalı.")
    @NotBlank
    private String password;

    @NotBlank
    private String username;

    // Opsiyonel ama boş gelirse service placeholder koyar
    private String firstName;
    private String lastName;

    // getter/setter...
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

}
