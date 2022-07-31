import { DAO } from './DAO';
import { UserDTO } from '../../models/DTOs/UserDTO';
import { passwordCryptography } from '../../utils/passwordCryptography';
import { v4 as uuiv4 } from 'uuid';

class UsersDAO extends DAO
{
    getUserByID (userID: string)
    {
        const sql = `SELECT userID,
                            userName,
                            password,
                            apiKey,
                            apiSecret
                    FROM users WHERE userID = ?`;

        return this.executeSQL<UserDTO>(sql, [ userID ]);
    }

    getUserByUserName (userName: string)
    {
        const sql = `SELECT userID,
                            userName,
                            password,
                            apiKey,
                            apiSecret
                    FROM users WHERE userName = ?`;

        return this.executeSQL<UserDTO>(sql, [ userName ]);
    }

    getAllUsers ()
    {
        const sql = `SELECT userID,
                            userName,
                            apiKey
                    FROM users`;

        return this.executeSQL<UserDTO>(sql, []);
    }

    createUser (user: UserDTO)
    {
        const sql = 'INSERT INTO users VALUES (?, ?, ?, ?, ?) RETURNING *';

        return this.executeSQL<UserDTO>(sql,
            [
                uuiv4(),
                user.userName,
                passwordCryptography.encryptPassword(user.password as string),
                user.apiKey,
                user.apiSecret
            ]);
    }
}

const usersDAO = new UsersDAO();
export { usersDAO };
