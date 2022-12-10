import API, { type User } from "../utils/api";
import { writable } from "svelte/store";
import { ErrorResponse } from "../utils/api"
import { getErrorMessage } from "../utils/error";

const STORAGE_TOKEN_KEY = "token";

export default class Auth {
    
    static token = writable<string | null>(localStorage.getItem(STORAGE_TOKEN_KEY) ?? null);
    static session = writable<User>(null);
    static loginError = writable<ErrorResponse>(null);

    static init () {
        Auth.token.subscribe(async token => {
            if (token === null) {
                localStorage.removeItem(STORAGE_TOKEN_KEY);
            } else {
                localStorage.setItem(STORAGE_TOKEN_KEY, token);
            }
            
            if (token) {
                // attempt login up to 5 times
                const attemptCount = 5;
                let attempt = 0;
                while (attempt < attemptCount) {
                    try {
                        const error = await API.session();
                        if (error instanceof ErrorResponse) {
                            API.logout();
                        }
                        break;
                    } catch (e) {
                        attempt++;
                    }
                    console.log("Failed to login, retrying...");
                    // wait a second before trying again
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                if (attempt >= attemptCount) {
                    API.logout();
                    Auth.loginError.set(new ErrorResponse(false, getErrorMessage("Failed to fetch")));
                }
            }
        });
    }
}