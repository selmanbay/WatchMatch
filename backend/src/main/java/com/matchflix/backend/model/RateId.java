package com.matchflix.backend.model;

import java.io.Serializable;
import java.util.Objects;

public class RateId implements Serializable {
    private Long user;
    private Long movie;

    public RateId() {}

    public RateId(Long user, Long movie) {
        this.user = user;
        this.movie = movie;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RateId)) return false;
        RateId that = (RateId) o;
        return Objects.equals(user, that.user) &&
                Objects.equals(movie, that.movie);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user, movie);
    }
}
