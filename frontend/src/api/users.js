import { request } from "./client";

export const usersApi = {
    countries: () => request("/countries"),
    login: (email, password) =>
        request("/users/login", { method: "POST", body: { email, password } }),
    register: (payload) =>
        request("/users/register", { method: "POST", body: payload }),
    savePreference: (userId, pref) =>
        request(`/users/${userId}/preference`, { method: "POST", body: pref }),
};
