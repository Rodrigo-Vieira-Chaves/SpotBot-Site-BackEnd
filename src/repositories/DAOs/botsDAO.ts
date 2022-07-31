import { BotDTO } from '../../models/DTOs/BotDTO';
import { DAO } from './DAO';
import { v4 as uuiv4 } from 'uuid';

class BotsDAO extends DAO
{
    getBotByID (botID: string)
    {
        const sql = `SELECT botID,
                            userID,
                            status
                    FROM bots WHERE botID = ?`;

        return this.executeSQL<BotDTO>(sql, [ botID ]);
    }

    getBotByUserID (userID: string)
    {
        const sql = `SELECT botID,
                            userID,
                            status
                    FROM bots WHERE userID = ?`;

        return this.executeSQL<BotDTO>(sql, [ userID ]);
    }

    getAllBots ()
    {
        const sql = `SELECT botID,
                            userID,
                            status
                    FROM bots`;

        return this.executeSQL<BotDTO>(sql, []);
    }

    createBot (bot: BotDTO)
    {
        const sql = `INSERT INTO bots VALUES (?, ?, ?) 
                    RETURNING *`;

        return this.executeSQL<BotDTO>(sql,
            [
                uuiv4(),
                bot.userID,
                bot.status
            ]);
    }

    updateBotStatus (botID: string, status: string)
    {
        const sql = `UPDATE bots SET status = ? WHERE botID = ?
                    RETURNING *`;

        return this.executeSQL<BotDTO>(sql,
            [
                status,
                botID
            ]);
    }
}

const botsDAO = new BotsDAO();
export { botsDAO };
