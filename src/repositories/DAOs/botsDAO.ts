import { BotDTO } from '../../models/DTOs/BotDTO';
import { DAO } from './DAO';
import { v4 as uuiv4 } from 'uuid';

class BotsDAO extends DAO
{
    getBotByID (botID: string)
    {
        const sql = `SELECT botID,
                            botName,
                            exchange,
                            status
                    FROM bots WHERE botID = ?`;

        return this.executeSQL<BotDTO>(sql, [ botID ]);
    }

    getBotByUserName (userID: string)
    {
        const sql = `SELECT botID,
                            botName,
                            exchange,
                            status
                    FROM bots WHERE userID = ?`;

        return this.executeSQL<BotDTO>(sql, [ userID ]);
    }

    getBotByBotName (botName: string)
    {
        const sql = `SELECT botID,
                            botName,
                            exchange,
                            status
                    FROM bots WHERE botName = ?`;

        return this.executeSQL<BotDTO>(sql, [ botName ]);
    }

    getAllBots ()
    {
        const sql = `SELECT botID,
                            botName,
                            exchange,
                            status
                    FROM bots`;

        return this.executeSQL<BotDTO>(sql, []);
    }

    createBot (bot: BotDTO)
    {
        const sql = `INSERT INTO bots VALUES (?, ?, ?, ?, ?) 
                    RETURNING *`;

        return this.executeSQL<BotDTO>(sql,
            [
                uuiv4(),
                bot.userID,
                bot.botName,
                bot.exchange,
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

    deleteBotByID (botID: string)
    {
        const sql = 'DELETE FROM bots WHERE botID = ? RETURNING *';

        return this.executeSQL<BotDTO>(sql, [ botID ]);
    }

    deleteBotByBotName (botName: string)
    {
        const sql = 'DELETE FROM bots WHERE botName = ? RETURNING *';

        return this.executeSQL<BotDTO>(sql, [ botName ]);
    }
}

const botsDAO = new BotsDAO();
export { botsDAO };
