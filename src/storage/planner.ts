import { writable } from "svelte/store";
import type { Author, Project, Task, User } from "../utils/api";
import API from "../utils/api";
import SocketServer from "../utils/socket";
import Auth from "./auth";

export const testStore = writable<string>('test')

type Listeners = {
    anonymous: number;
    users: User[];
}

export default class Planner {
    static userStore = writable<{ [username: string]: User }>({});
    static projectStore = writable<{ [project_id: string]: Project }>({});
    static taskStore = writable<{ [project_id: string]: Task[] }>({});
    static authorStore = writable<{ [project_id: string]: Author[] }>({});
    static listenersStore = writable<{ [project_id: string]: Listeners | undefined }>({});
    
    static async init () {
        let previousUser: User = null;
        Auth.session.subscribe(async user => {
            if (user) {
                await API.projects(user.user_id);
            } else {
                if (previousUser) {
                    Planner.projectStore.update((projects) => {
                        for (const project_id in projects) {
                            if (projects[project_id].user_id === previousUser.user_id) {
                                delete projects[project_id];
                            }
                        }
                        return projects;
                    });
                }
            }
            previousUser = user;
        });
        // Tasks
        SocketServer.on("task_update", async data => {
            if (data && data.task) {
                const task: Task = data.task;
                API.taskUpsertEvent(task.project_id, task);
            } else {
                console.log("task_update event missing data", data);
            }
        });
        SocketServer.on("task_create", async data => {
            if (data && data.task) {
                const task: Task = data.task;
                API.taskUpsertEvent(task.project_id, task);
            } else {
                console.log("task_update event missing data", data);
            }
        });
        SocketServer.on("task_delete", async data => {
            if (data && data.task) {
                const task: Task = data.task;
                API.taskDeleteEvent(task.project_id, task.task_id);
            } else {
                console.log("task_update event missing data", data);
            }
        });
        // Projects
        SocketServer.on("project_update", async data => {
            if (data && data.project) {
                const project: Project = data.project;
                API.projectUpsertEvent(project);
            } else {
                console.log("project_update event missing data", data);
            }
        });
        SocketServer.on("project_listeners", async data => {
            if (data && data.project_id && data.listeners) {
                const project_id = data.project_id;
                const listeners: { anonymous: number; users: User[] } = data.listeners;
                Planner.listenersStore.update((projects) => {
                    projects[project_id] = listeners;
                    return projects;
                });
            } else {
                console.log("project_listeners event missing data", data);
            }
        })
    }
}