import { Request, Response } from 'express';
import { Controller } from './Controller';
import { authToken } from '../middlewares/AuthToken';
import { botsService } from '../services/botsService';

class BotsController extends Controller
{
    getBotsByUsername (req: Request, res: Response)
    {
        this.callService(res, botsService.getBotsByUsername.bind(botsService), authToken.verifyToken(req.cookies.bearer).payload);
    }

    createBot (req: Request, res: Response)
    {
        req.body.userName = authToken.verifyToken(req.cookies.bearer).payload;
        this.callService(res, botsService.createBot.bind(botsService), req.body);
    }

    startBot (req: Request, res: Response)
    {
        req.body.userName = authToken.verifyToken(req.cookies.bearer).payload;
        this.callService(res, botsService.startBot.bind(botsService), req.body);
    }

    makeBotIdleOrStopAfterTrade (req: Request, res: Response)
    {
        req.body.userName = authToken.verifyToken(req.cookies.bearer).payload;
        this.callService(res, botsService.makeBotIdleOrStopAfterTrade.bind(botsService), req.body);
    }

    deleteBot (req: Request, res: Response)
    {
        req.body.userName = authToken.verifyToken(req.cookies.bearer).payload;
        this.callService(res, botsService.deleteBot.bind(botsService), req.body);
    }
}

const botsController = new BotsController();
export { botsController };
