package com.matchflix.backend.repository;

import com.matchflix.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);

    @Query("select u from User u left join fetch u.country where u.id = :id")
    Optional<User> findByIdFetchCountry(@Param("id") Long id);
}

