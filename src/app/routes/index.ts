import { Router } from "express";
import { BracBankRoutes } from "../modules/bracBank/bracBank.router";


export const router = Router();

const moduleRoute = [
    {
        path: "/brac",
        route: BracBankRoutes
    },
];

moduleRoute.forEach(route => {
    router.use(route.path, route.route);
})