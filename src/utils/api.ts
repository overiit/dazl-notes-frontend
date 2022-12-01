import Auth from "../storage/auth";
import { get } from "svelte/store"
import { API_URL } from "./constants";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

export default class API {
    private static api = async (method: Method = "GET", path: string = "/status", body: Record<string, any> = undefined) => {
        const Authorization = get(Auth.token);
        const response = await fetch(`${API_URL}${path}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": Authorization ? Authorization : undefined
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        return await response.json();
    }

    // endpoints
    static account = async () => {
        return await API.api("GET", "/user");
    }

    static authAccess = async (username: string, password: string) => {
        return await API.api("POST", "/auth/access", { username, password });
    }

    static login = async () => {
        const response = await API.account();
        Auth.user.set(response.data.user);
        return response;
    }

    static access = async (username: string, password: string) => {
        const access = await API.authAccess(username, password);
        if (access.success) {
            Auth.token.set(access.data.session.token);
        } else {
            API.logout();
        }
        return await API.login();
    }

    static logout = () => {
        Auth.token.set(null);
        Auth.user.set(null);
    }
}