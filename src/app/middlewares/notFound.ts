import { Request, Response } from "express";
import statusCode from "http-status-codes";

const notFound = (req: Request, res: Response) => {
    res.status(statusCode.NOT_FOUND).json({
        success: false,
        message: "Route Not Found",
    })
};

export default notFound;