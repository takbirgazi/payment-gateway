import express, { Request, Response } from "express";
import { router } from "./app/routes";
import { envVars } from "./app/config/env";
import cors from "cors";
import expressSession from "express-session";
import cookieParser from "cookie-parser";
import notFound from "./app/middlewares/notFound";
import { globalError } from "./app/middlewares/globalErrorHandlers";

const app = express();
app.use(express.json());
app.set("trust proxy", 1); // trust first proxy
app.use(express.urlencoded({ extended: true }));
app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(cookieParser());
app.use(cors({
    origin: envVars.FRONTEND_URL,
    credentials: true,
}));

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        "message": "Welcome to No Cash!"
    })
});

// Global Error Handle 
app.use(globalError);
// Not Found Route
app.use(notFound);

export default app;