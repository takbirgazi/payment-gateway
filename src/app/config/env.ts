import dotenv from "dotenv";

dotenv.config();

interface EnvVariable {
    PORT: string,
    DB_URL: string,
    NODE_ENV: "development" | "production",
    EXPRESS_SESSION_SECRET: string,
    FRONTEND_URL: string
};

const loadEnv = (): EnvVariable => {
    const requireVar: string[] = ["PORT", "DB_URL", "NODE_ENV", "EXPRESS_SESSION_SECRET", "FRONTEND_URL"];

    requireVar.forEach(key => {
        if (!process.env[key]) {
            throw Error(`Missing Environment VAriable ${key}`);
        }
    });

    return {
        PORT: process.env.PORT as string,
        DB_URL: process.env.DB_URL as string,
        NODE_ENV: process.env.NODE_ENV as "development" | "production",
        EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
        FRONTEND_URL: process.env.FRONTEND_URL as string,
    }
};

export const envVars = loadEnv();