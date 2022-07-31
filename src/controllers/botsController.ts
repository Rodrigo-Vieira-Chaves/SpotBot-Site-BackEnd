import { Request, Response } from 'express';
import { Controller } from './Controller';
import { botsService } from '../services/botsService';

class BotsController extends Controller
{
    getBotByID (req: Request, res: Response)
    {
        this.callService(res, botsService.getBotByID.bind(botsService), req.params.id);
    }

    getBotByUserID (req: Request, res: Response)
    {
        this.callService(res, botsService.getBotByUserID.bind(botsService), req.params.userid);
    }

    getAllBots (req: Request, res: Response)
    {
        this.callService(res, botsService.getAllBots.bind(botsService));
    }

    createBot (req: Request, res: Response)
    {
        this.callService(res, botsService.createBot.bind(botsService), req.body);
    }

    updateBotStatus (req: Request, res: Response)
    {
        this.callService(res, botsService.updateBotStatus.bind(botsService), req.body);
    }
}

const botsController = new BotsController();
export { botsController };
