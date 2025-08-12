import { request } from "./client";

export const tmdbApi = {
    popular: () => request("/tmdb/popular"),
    search: (query) => request(`/tmdb/search?query=${encodeURIComponent(query)}`),
};
