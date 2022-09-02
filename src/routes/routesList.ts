import express, { Express } from 'express';
import { authToken } from '../middlewares/AuthToken';
import { botsController } from '../controllers/botsController';
import { usersController } from '../controllers/usersController';

class Routes
{
    initRoutes (app: Express)
    {
        app.use('/createLogin', this.createLoginRoutes());
        app.use('/changePassword', this.changePasswordRoutes());
        app.use('/authenticateLogin', this.authenticateLoginRoutes());
        app.use('/checkLogin', this.checkLoginRoutes());
        app.use('/logout', this.getLogoutRoutes());
        app.use('/bots', this.getBotsRoutes());
    }

    private createLoginRoutes ()
    {
        const createLoginRoutes = express.Router();

        createLoginRoutes.post('/', usersController.createUser.bind(usersController));

        return createLoginRoutes;
    }

    private changePasswordRoutes ()
    {
        const changePasswordRoutes = express.Router();

        changePasswordRoutes.post('/', authToken.verifyTokenMiddleWare.bind(authToken), usersController.changePassword.bind(usersController));

        return changePasswordRoutes;
    }

    private authenticateLoginRoutes ()
    {
        const authenticateLoginRoutes = express.Router();

        authenticateLoginRoutes.post('/', usersController.authenticateUser.bind(usersController));

        return authenticateLoginRoutes;
    }

    private checkLoginRoutes ()
    {
        const checkLoginRoutes = express.Router();

        checkLoginRoutes.get('/', usersController.checkIfUserIsAuthenticated.bind(usersController));

        return checkLoginRoutes;
    }

    private getLogoutRoutes ()
    {
        const getLogoutRoutes = express.Router();

        getLogoutRoutes.get('/', authToken.verifyTokenMiddleWare.bind(authToken), usersController.logout.bind(usersController));

        return getLogoutRoutes;
    }

    private getBotsRoutes ()
    {
        const getBotsRoutes = express.Router();

        getBotsRoutes.get('/', authToken.verifyTokenMiddleWare.bind(authToken), botsController.getBotsByUsername.bind(botsController));
        getBotsRoutes.post('/', authToken.verifyTokenMiddleWare.bind(authToken), botsController.createBot.bind(botsController));
        getBotsRoutes.put('/', authToken.verifyTokenMiddleWare.bind(authToken), botsController.updateBotStatus.bind(botsController));
        getBotsRoutes.delete('/', authToken.verifyTokenMiddleWare.bind(authToken), botsController.deleteBot.bind(botsController));

        return getBotsRoutes;
    }
}

const routes = new Routes();
export { routes };
