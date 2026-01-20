/* eslint-disable no-console */
import { Server } from "http";
import { envVars } from "./app/config/env";
import app from "./app";


let server: Server;

const startServer = async () => {
    try {
        server = app.listen(envVars.PORT, () => {
            console.log(`Server is running at port: ${envVars.PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
};

(async () => {
    await startServer();
})();

// Handle Server Error Start =====================================================================
process.on("SIGINT", () => {
    console.log(`SIGINT receive. Server is shutting down... `);
    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1);
});
process.on("SIGTERM", () => {
    console.log(`SIGTERM receive. Server is shutting down... `);
    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1);
});
process.on("unhandledRejection", (error) => {
    console.log(`Unhandled Rejection Error. Server is shutting down... `, error);
    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1);
});
process.on("uncaughtException", (error) => {
    console.log(`Uncaught Exception Error. Server is shutting down... `, error);
    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1);
});
// Handle Server Error End =======================================================================