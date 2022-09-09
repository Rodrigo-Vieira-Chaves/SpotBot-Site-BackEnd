import { BotDTO } from '../../models/DTOs/BotDTO';
import { BotStatus } from '../../services/BotStatus';
import { DAO } from './DAO';
import { v4 as uuiv4 } from 'uuid';

class BotsDAO extends DAO
{
    getBotByID (botID: string)
    {
        const sql = `SELECT botID,
                            botName,
                            exchange,
                            status,
                            account,
                            apiKey,
                            apiSecret
                    FROM bots WHERE botID = ?`;

        return this.executeSQL<BotDTO>(sql, [ botID ]);
    }

    getBotsByUserID (userID: string)
    {
        const sql = `SELECT botID,
                            botName,
                            exchange,
                            status,
                            account
                    FROM bots WHERE userID = ?`;

        return this.executeSQL<BotDTO>(sql, [ userID ]);
    }

    getBotsByApiKeyOrSecret (apiKeyOrSecret: string)
    {
        const sql = `SELECT botID,
                            botName,
                            exchange,
                            status,
                            account
                    FROM bots WHERE apiKey = ? OR apiSecret = ?`;

        return this.executeSQL<BotDTO>(sql, [ apiKeyOrSecret, apiKeyOrSecret ]);
    }

    getBotByBotName (botName: string)
    {
        const sql = `SELECT botID,
                            botName,
                            exchange,
                            status,
                            account
                    FROM bots WHERE botName = ?`;

        return this.executeSQL<BotDTO>(sql, [ botName ]);
    }

    getAllBots ()
    {
        const sql = `SELECT botID,
                            botName,
                            exchange,
                            status,
                            account
                    FROM bots`;

        return this.executeSQL<BotDTO>(sql, []);
    }

    createBot (bot: BotDTO)
    {
        const sql = `INSERT INTO bots VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    RETURNING botName, exchange, status, account`;

        return this.executeSQL<BotDTO>(sql,
            [
                uuiv4(),
                bot.userID,
                bot.botName,
                bot.exchange,
                bot.status,
                bot.account,
                bot.apiKey,
                bot.apiSecret
            ]);
    }

    updateBotStatus (botID: string, status: BotStatus)
    {
        const sql = `UPDATE bots SET status = ? WHERE botID = ?
                    RETURNING botName, exchange, status, account`;

        return this.executeSQL<BotDTO>(sql,
            [
                status,
                botID
            ]);
    }

    deleteBotByID (botID: string)
    {
        const sql = 'DELETE FROM bots WHERE botID = ? RETURNING botName, exchange, status, account';

        return this.executeSQL<BotDTO>(sql, [ botID ]);
    }

    deleteBotByBotName (botName: string)
    {
        const sql = 'DELETE FROM bots WHERE botName = ? RETURNING botName, exchange, status, account';

        return this.executeSQL<BotDTO>(sql, [ botName ]);
    }
}

const botsDAO = new BotsDAO();
export { botsDAO };
