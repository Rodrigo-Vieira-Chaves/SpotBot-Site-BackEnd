import { Service } from './Service';
import { UserDTO } from '../models/DTOs/UserDTO';
import { usersDAO } from '../repositories/DAOs/usersDAO';
import { usersPropertiesValidator } from '../validators/usersPropertiesValidator';

class UsersService extends Service
{
    async getUserByID (userID: string)
    {
        const result = await usersDAO.getUserByID(userID);

        return this.serviceResponseBuilder(result, `O usuário ${userID} não existe.`);
    }

    async getUserByUserName (userName: string)
    {
        usersPropertiesValidator.validateUserName(userName);
        const result = await usersDAO.getUserByUserName(userName);

        return this.serviceResponseBuilder(result, `O usuário ${userName} não existe.`);
    }

    async getAllUsers ()
    {
        const result = await usersDAO.getAllUsers();

        return this.serviceResponseBuilder(result, 'Não há usuários cadastrados.');
    }

    async createUser (user: UserDTO)
    {
        usersPropertiesValidator.validateAll(user);
        const result = await usersDAO.createUser(user);

        return this.serviceResponseBuilder(result, 'Erro ao criar novo usuário.', 201);
    }
}

const usersService = new UsersService();
export { usersService };
