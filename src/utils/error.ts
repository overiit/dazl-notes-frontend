export const getErrorMessage = (error: Error | string) => {
    const message = error instanceof Error ? error.message : error;
    if (message === "Failed to fetch") {
        return "Failed to connect to the server";
    }
    return message;
}