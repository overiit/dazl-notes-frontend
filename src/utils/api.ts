import Auth from "../storage/auth";
import { get } from "svelte/store"
import { API_URL } from "./constants";
import Planner from "../storage/planner";
import SocketServer from "./socket";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

type APISuccessResponse<T> = {
    success: true;
    data: T;
}

export class ErrorResponse {
    constructor (public readonly success: false, public readonly message: string) {}
}

export type APIResponse<T> = ErrorResponse | APISuccessResponse<T>;

export type User = {
    user_id: string;
    username: string;
    permission_level: number;
}

export type Author = {
    project_id: string;
    user_id: string;
    username: string;
}

export type Session = {
    user_id: string;
    token: string;
    ends_at: string;
}

export type Project = {
    project_id: string;
    name: string;
    user_id: string;
    username: string;
    public: boolean;
    updated_at: string;
    created_at: string;
}

export type Task = {
    task_id: string;
    parent_id?: string;
    project_id: string;
    name: string;
    description: string;
    user_id: string;
    status: string;
    updated_at: string;
    created_at: string;
}

export enum AuthorPermission {
    VIEWER = "viewer",
    COMMENTER = "commenter",
    EDITOR = "editor"
}

export default class API {

    private static api = async <T extends Record<any, any>>(method: Method = "GET", path: string = "/status", body: Record<string, any> = undefined): Promise<APIResponse<T>> => {
        const Authorization = get(Auth.token);
        const response = await fetch(`${API_URL}${path}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": Authorization ? Authorization : undefined
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        const json = await response.json();
        if (json.success) {
            return json;
        }
        return new ErrorResponse(json.success, json.message);
    }

    private static requireLoggedIn = () => {
        const token = get(Auth.token);
        if (!token) return new ErrorResponse(false, "Not logged in");
    }

    static projects = async (user_id: string) => {
        const query = new URLSearchParams();
        if (user_id) {
            query.set("user_id", user_id);
        }
        const response = await API.api<{ projects: Project[] }>("GET", `/projects?${query.toString()}`);
        if (response.success) {
            for (const project of response.data.projects) {
                API.projectUpsertEvent(project);
            }
        }
        return response;
    }

    static project = async (user_id: string, project_id: string) => {
        const query = new URLSearchParams({
            user_id,
        });
        const response = await API.api<{ project: Project }>("GET", `/projects/${project_id}?${query.toString()}`);
        if (response.success) {
            API.projectUpsertEvent(response.data.project);
        } else {
            API.projectDeleteEvent(project_id);
        }
        return response;
    }

    static projectUpsertEvent = ( project: Project) => {
        Planner.projectStore.update((projects) => {
            projects[project.project_id] = project;
            return projects;
        });
    }

    static projectDeleteEvent = (project_id: string) => {
        Planner.projectStore.update((projects) => {
            delete projects[project_id];
            return projects;
        });
    }

    static createProject = async (body: { name: string, public?: boolean }) => {
        const loggedIn = API.requireLoggedIn();
        if (loggedIn instanceof ErrorResponse) return loggedIn;
        const response = await API.api<{ project: Project }>("POST", "/projects", body);
        if (response.success) {
            API.projectUpsertEvent(response.data.project);
        }
        return response;
    }

    static updateProject = async (project_id: string, body: { name?: string, public?: boolean }) => {
        const loggedIn = API.requireLoggedIn();
        if (loggedIn instanceof ErrorResponse) return loggedIn;
        const response = await API.api<{ project: Project }>("PATCH", `/projects/${project_id}`, body);
        if (response.success) {
            API.projectUpsertEvent(response.data.project);
        } else {
            API.projectDeleteEvent(project_id);
        }
        return response;
    }

    static authors = async (project_id: string) => {
        const response = await API.api<{ authors: Author[] }>("GET", `/projects/${project_id}/authors`);
        if (response.success) {
            Planner.authorStore.update((authors) => {
                const project = get(Planner.projectStore)[project_id];
                if (project) {
                    authors[project_id] = response.data.authors;
                }
                return authors;
            });
        } else {
            Planner.authorStore.update((authors) => {
                delete authors[project_id];
                return authors;
            });
        }
        return response;
    }

    static addAuthor = async (project_id: string, username: string, permission: AuthorPermission) => {
        const loggedIn = API.requireLoggedIn();
        if (loggedIn instanceof ErrorResponse) return loggedIn;
        const response = await API.api<{ author: Author }>("POST", `/projects/${project_id}/authors`, { username, permission });
        if (response.success) {
            Planner.authorStore.update((authors) => {
                const project = get(Planner.projectStore)[project_id];
                if (project) {
                    authors[project_id] = [...authors[project_id], response.data.author];
                }
                return authors;
            });
        }
        return response;
    }

    static removeAuthor = async (project_id: string, username: string) => {
        const loggedIn = API.requireLoggedIn();
        if (loggedIn instanceof ErrorResponse) return loggedIn;
        const response = await API.api<{ success: boolean }>("DELETE", `/projects/${project_id}/authors`, {
            username
        });
        if (response.success) {
            Planner.authorStore.update((authors) => {
                const project = get(Planner.projectStore)[project_id];
                if (project) {
                    authors[project_id] = authors[project_id].filter(author => author.username !== username);
                }
                return authors;
            });
        }
        return response;
    }

    static tasks = async (project_id: string, parent_id?: string) => {
        const query = new URLSearchParams({
            project_id
        });
        if (parent_id) {
            query.set("parent_id", parent_id);
        }
        
        const response = await API.api<{ tasks: Task[] }>("GET", `/tasks?${query.toString()}`);
        if (response.success) {
            Planner.taskStore.update(tasks => {
                tasks[project_id] = response.data.tasks;
                return tasks;
            });
        } else {
            Planner.taskStore.update(tasks => {
                delete tasks[project_id];
                return tasks;
            });
        }
        return response;
    }

    static taskUpsertEvent = (project_id: string, task: Task) => {
        const tasks = get(Planner.taskStore);
        const localTask = tasks[project_id]?.find(t => t.task_id === task.task_id);
        if (localTask) {
            // if task exists locally, update it
            Planner.taskStore.update((tasks) => {
                const index = tasks[project_id].indexOf(localTask);
                tasks[project_id][index] = {
                    ...localTask,
                    ...task
                };
                return tasks;
            });
        } else {
            // otherwise, add it
            Planner.taskStore.update((tasks) => {
                tasks[project_id] = [...tasks[project_id], task];
                return tasks;
            });
        }
    }
    
    static taskDeleteEvent = (project_id: string, task_id: string) => {
        Planner.taskStore.update((tasks) => {
            const index = tasks[project_id].findIndex(task => task.task_id === task_id);
            if (index !== -1) {
                tasks[project_id].splice(index, 1);
            }
            return tasks;
        });
    }

    static createTask = async (project_id: string, name: string, description: string, parent_id?: string) => {
        const loggedIn = API.requireLoggedIn();
        if (loggedIn instanceof ErrorResponse) return loggedIn;
        const response = await API.api<{ task: Task }>("POST", "/tasks", { project_id, name, description, parent_id });
        if (response.success) {
            API.taskUpsertEvent(project_id, response.data.task);
        }
        return response;
    }

    static updateTask = async (task_id: string, body: { name?: string, description?: string, status?: string }) => {
        const loggedIn = API.requireLoggedIn();
        if (loggedIn instanceof ErrorResponse) return loggedIn;
        const response = await API.api<{ task: Task }>("PATCH", `/tasks/${task_id}`, body);
        if (response.success) {
            API.taskUpsertEvent(response.data.task.project_id, response.data.task);
        }
        return response;
    }

    static deleteTask = async (project_id: string, task_id: string) => {
        const loggedIn = API.requireLoggedIn();
        if (loggedIn instanceof ErrorResponse) return loggedIn;
        const response = await API.api<{ success: boolean }>("DELETE", `/tasks/${task_id}`);
        if (response.success) {
            API.taskDeleteEvent(project_id, task_id);
        }
        return response;
    }


    static session = async () => {
        const loggedIn = API.requireLoggedIn();
        if (loggedIn instanceof ErrorResponse) return loggedIn;
        SocketServer.emit("login", { token: get(Auth.token) });
        const response = await API.api<{ user: User }>("GET", "/user");
        if (response.success) {
            Auth.session.set(response.data.user);
            Auth.loginError.set(null);
            Planner.userStore.update((users) => {
                users[response.data.user.user_id] = response.data.user;
                return users;
            });
        } else {
            if (response instanceof ErrorResponse) {
                Auth.loginError.set(response);
            }
        }
        return response;
    }

    static user = async (username: string) => {
        const query = new URLSearchParams({
            username
        });
        const response = await API.api<{ user: User }>("GET", `/user?${query.toString()}`);
        if (response.success) {
            Planner.userStore.update(users => {
                users[username] = response.data.user;
                return users;
            });
        } else {
            Planner.userStore.update(users => {
                delete users[username];
                return users;
            });
        }
    }

    static signup = async (username: string, password: string) => {
        const access = await API.api<{ session: Session }>("POST", "/auth/signup", { username, password });
        if (access.success) {
            Auth.token.set(access.data.session.token);
        } else {
            API.logout();
            return access
        }
        return await API.session();
    }

    static signin = async (username: string, password: string) => {
        const access = await API.api<{ session: Session }>("POST", "/auth/signin", { username, password });
        if (access.success) {
            Auth.token.set(access.data.session.token);
        } else {
            API.logout();
            return access
        }
        return await API.session();
    }

    static logout = () => {
        Auth.token.set(null);
        Auth.session.set(null);
    }
}