import express, { Express } from 'express';
import { botsController } from '../controllers/botsController';
import { usersController } from '../controllers/usersController';

class Routes
{
    initRoutes (app: Express)
    {
        app.use('/login', this.getLoginRoutes());
        app.use('/bot', this.getBotRoutes());
    }

    private getLoginRoutes ()
    {
        const getLoginRoutes = express.Router();

        getLoginRoutes.get('/:id', usersController.getUserByID.bind(usersController));
        // TODO essa rota pode estar inacessivel... mesmo do :id
        getLoginRoutes.get('/:username', usersController.getUserByUserName.bind(usersController));
        getLoginRoutes.get('/', usersController.getAllUsers.bind(usersController));
        getLoginRoutes.post('/', usersController.createUser.bind(usersController));

        return getLoginRoutes;
    }

    private getBotRoutes ()
    {
        const getBotRoutes = express.Router();

        getBotRoutes.get('/:id', botsController.getBotByID.bind(botsController));
        // TODO essa rota pode estar inacessivel... mesmo do :id
        getBotRoutes.get('/:userid', botsController.getBotByUserID.bind(botsController));
        getBotRoutes.get('/', botsController.getAllBots.bind(botsController));
        getBotRoutes.post('/', botsController.createBot.bind(botsController));
        getBotRoutes.put('/', botsController.updateBotStatus.bind(botsController));
        getBotRoutes.delete('/:id', botsController.deleteBot.bind(botsController));

        return getBotRoutes;
    }
}

const routes = new Routes();
export { routes };
