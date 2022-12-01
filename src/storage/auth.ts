import API from "../utils/api";
import { writable } from "svelte/store";

const STORAGE_TOKEN_KEY = "token";

type User = {
    user_id: string;
    username: string;
    permission_level: number;
}

export default class Auth {
    static token = writable<string | null>(localStorage.getItem(STORAGE_TOKEN_KEY) ?? null);
    static user = writable<User>(null);

    static init () {
        Auth.token.subscribe(async token => {
            if (token === null) {
                localStorage.removeItem(STORAGE_TOKEN_KEY);
            } else {
                localStorage.setItem(STORAGE_TOKEN_KEY, token);
            }
            
            if (token) {
                try {
                    await API.login();
                } catch (err) {
                    // logout when login connectio fails (API down)
                    API.logout();
                }
            }
        });
    }
}