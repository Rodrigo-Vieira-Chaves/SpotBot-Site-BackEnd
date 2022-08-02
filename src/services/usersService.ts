import { Service } from './Service';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { UserDTO } from '../models/DTOs/UserDTO';
import { usersDAO } from '../repositories/DAOs/usersDAO';
import { usersPropertiesValidator } from '../validators/usersPropertiesValidator';

class UsersService extends Service
{
    async getUserByID (userID: string)
    {
        const result = await usersDAO.getUserByID(userID);

        return this.serviceResponseBuilder(result, `User ${userID} does not exist.`);
    }

    async getUserByUserName (userName: string)
    {
        usersPropertiesValidator.validateUserName(userName);
        const result = await usersDAO.getUserByUserName(userName);

        return this.serviceResponseBuilder(result, `User ${userName} does not exist.`);
    }

    async getAllUsers ()
    {
        const result = await usersDAO.getAllUsers();

        return this.serviceResponseBuilder(result, 'There are no users in database.');
    }

    async createUser (user: UserDTO)
    {
        usersPropertiesValidator.validateAll(user);
        const existentUser = await usersDAO.getUserByUserName(user.userName);

        if (existentUser.length > 0)
        {
            throw new UnauthorizedError('User already exists in database.');
        }

        const result = await usersDAO.createUser(user);

        return this.serviceResponseBuilder(result, `Error when inserting user ${user.userName} in database.`, 201);
    }
}

const usersService = new UsersService();
export { usersService };
