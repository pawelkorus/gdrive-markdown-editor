interface Message {
    message: string,
    type: "info" | "error",
    errorDetails?: Error
}
