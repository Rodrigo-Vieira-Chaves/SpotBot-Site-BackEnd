import express, { Express } from 'express';
import { botsController } from '../controllers/botsController';
import { usersController } from '../controllers/usersController';

class Routes
{
    initRoutes (app: Express)
    {
        app.use('/createLogin', this.getLoginRoutes());
        app.use('/authenticateLogin', this.getAuthenticateRoutes());
        app.use('/checkLogin', this.getCheckRoutes());
        app.use('/logout', this.getLogoutRoutes());
        app.use('/bot', this.getBotRoutes());
    }

    private getLoginRoutes ()
    {
        const getLoginRoutes = express.Router();

        getLoginRoutes.post('/', usersController.createUser.bind(usersController));

        return getLoginRoutes;
    }

    private getAuthenticateRoutes ()
    {
        const getAuthenticateRoutes = express.Router();

        getAuthenticateRoutes.post('/', usersController.authenticateUser.bind(usersController));

        return getAuthenticateRoutes;
    }

    private getCheckRoutes ()
    {
        const getCheckRoutes = express.Router();

        getCheckRoutes.get('/', usersController.checkIfUserIsAuthenticated.bind(usersController));

        return getCheckRoutes;
    }

    private getLogoutRoutes ()
    {
        const getLogoutRoutes = express.Router();

        getLogoutRoutes.get('/', usersController.logout.bind(usersController));

        return getLogoutRoutes;
    }

    private getBotRoutes ()
    {
        const getBotRoutes = express.Router();

        // authToken.validateToken.bind(authToken)
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
