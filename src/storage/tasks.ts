import { writable } from "svelte/store";

export const selectedProject = writable<string>(null);
