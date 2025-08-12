import { request } from "./client";

export const moviesApi = {
    list: () => request("/movies"),
    add: (movie) => request("/movies", { method: "POST", body: movie }),
};
