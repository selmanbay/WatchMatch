# WatchMatch

A movie recommendation platform that also matches *people*: it learns your taste
from what you rate and list, recommends films through an embedding-based
similarity service, and finds users whose taste overlaps with yours — then
suggests what the two of you could watch together.

Built as three services: a Spring Boot API, a React front-end, and a separate
Python recommendation service.

## Architecture

```
React (CRA + craco)          Spring Boot 3 / Java 17         Python / FastAPI
  :3000            ──────▶     :8080                 ──────▶   :8000
  UI                           REST API, JWT auth               embedding
                               taste profiles, matching         similarity
                                     │
                                     ▼
                               PostgreSQL 15
                                     │
                                     ▼
                               TMDB API (proxied)
```

The React app never talks to TMDB directly and never sees the TMDB key — every
call goes through `TmdbProxyController` on the backend. The key stays server-side.

## How recommendations work

The backend does not run the model itself; it decides *what to ask* and turns the
answer back into domain objects.

1. **Build seeds** (`reco/UserSignalsService`). Your signals are ranked: films
   you rated 8 or higher first, then your Like list, then Watched, then Wishlist.
   The first five distinct TMDB ids win — the Python service takes at most five.
2. **Ask the model** (`ml/MochinefClient`). Those seeds go to `POST /recommend`,
   which returns candidates scored by embedding similarity.
3. **Resolve and hydrate** (`reco/RecoService`). Returned TMDB ids are looked up
   in Postgres and mapped to DTOs, preserving the model's ordering.

If a user has no signals yet, it falls back to a global recommendation call
instead of returning an empty feed.

User ids are salted and hashed (`RECO_USER_SALT`) before they leave the backend,
so the recommendation service never receives a real user id.

## How user matching works

Separate mechanism, and the part the name comes from (`service/MatchService`).

Each user gets a **genre weight vector**, built by walking their lists and
weighting each genre by how the film was filed:

| List | Weight |
|---|---|
| Watched | 1.0 |
| Like | 0.7 |
| Wishlist | 0.5 |
| Dislike | −0.5 |
| Other | 0.2 |

A film counts once even if it sits in several lists. Negative totals are clamped
to zero so the vectors stay valid for cosine similarity. The vector and its
**L2 norm are stored precomputed** in `user_genre_weights` — the norm is the
expensive half of cosine, and caching it means comparing two users is a dot
product and a division. The table is indexed on user, country and update time,
so the candidate scan stays cheap.

Matching then ranks users by cosine similarity, optionally restricted to the same
country. `RecoService.match(userA, userB)` intersects two users' recommendation
sets to produce something both would plausibly want to watch.

## Running it

The Java + Postgres half runs from Compose:

```bash
cp .env.example .env      # fill in TMDB_API_KEY, JWT_SECRET, RECO_USER_SALT
docker compose up --build
```

The secret properties have no fallback defaults — if a variable is missing the
app fails at startup rather than running with a guessable value.

Front-end:

```bash
cd frontend && npm install && npm start     # :3000
```

**The Python recommendation service lives in a separate repository and is not
included here.** Without it running on `ML_BASE_URL`, authentication, browsing,
lists, ratings and TMDB search all work, but the recommendation and match
endpoints return empty results.

## Stack

Spring Boot 3, Java 17, Spring Security + JWT, Spring Data JPA, PostgreSQL 15,
Maven, Docker Compose · React 18, craco, lucide-react · FastAPI (separate repo).

## Status

Working prototype from a personal project, not production software.

- The recommendation service is a hard dependency with no graceful degradation —
  the feed is empty rather than falling back to something reasonable.
- `MatchScore` is a stub entity; match scores are computed on demand rather than
  persisted.
- No test coverage to speak of.
