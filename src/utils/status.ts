export const statusList = ["TODO", "IN PROGRESS", "BLOCKED", "COMPLETE"];

export const statusToBtn = (status: string) => {
    switch(status) {
        case "TODO":
            return "btn-todo btn-todo-solid";
        case "IN PROGRESS":
            return "btn-in-progress btn-in-progress-solid";
        case "BLOCKED":
            return "btn-blocked btn-blocked-solid";
        case "COMPLETE":
            return "btn-complete btn-complete-solid";
        default:
            return "gray";
    }
};

export const statusToIcon = (status: string) => {
    switch(status) {
        case "TODO":
            return "&dash;";
        case "IN PROGRESS":
            return "&gt;";
        case "COMPLETE":
            return "&check;";
        case "BLOCKED":
            return "&cross;";
        default:
            return "";
    }
}