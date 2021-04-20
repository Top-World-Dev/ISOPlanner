export default class AppError {
    code?: string;
    message: string;
    debug?: string;
    stack?: string;

    constructor (message: string, code?: string, debug?: string, stack?: string) {
        this.message = message;
        this.code = code;
        this.debug = debug;
        this.stack = stack;
    }

    static fromApiError(error: any): AppError {

        const ae = new AppError(error.message ? error.message : "Unknown error");

        if (error.isAxiosError && error.response) {
            ae.debug = error.response.data ? error.response.data : "";
            ae.code = error.response.status ? error.response.status.toString() : "";
            ae.stack = error.stack ? error.stack : "";
        } else {
            ae.code = error.code ? error.code.toString() : "";
            ae.stack = error.stack ? error.stack : "";
        }

        return ae;
    }
}