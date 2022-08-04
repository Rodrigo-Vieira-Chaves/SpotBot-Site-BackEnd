import { BotDTO } from '../models/DTOs/BotDTO';
import { BotStatus } from './BotStatus';
import { Service } from './Service';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { botsDAO } from '../repositories/DAOs/botsDAO';
import { botsManager } from './BotsManager';
import { botsPropertiesValidator } from '../validators/botsPropertiesValidator';
import { usersService } from './usersService';

class BotsService extends Service
{
    async getBotByID (botID: string)
    {
        const result = await botsDAO.getBotByID(botID);

        return this.serviceResponseBuilder(result, `Bot ${botID} does not exist.`);
    }

    async getBotsByUsername (userName: string)
    {
        const result = await botsDAO.getBotByUserName(userName);

        return this.serviceResponseBuilder(result, `User ${userName} has no bots created.`);
    }

    async getAllBots ()
    {
        const result = await botsDAO.getAllBots();

        return this.serviceResponseBuilder(result, 'There are no bots in database.');
    }

    async createBot (bot: BotDTO)
    {
        const newBot = bot;
        botsPropertiesValidator.validateExchange(newBot.exchange);
        botsPropertiesValidator.validateBotAccount(newBot.account);

        const botName = this.getBotName(newBot);
        const existentBot = await botsDAO.getBotByBotName(botName);

        if (existentBot.length > 0)
        {
            throw new UnauthorizedError('User cannot duplicate a preexistent bot.');
        }

        const user = await usersService.getUserByUserName(newBot.userName);

        newBot.botName = botName;
        newBot.status = BotStatus.IDLE;
        newBot.userID = user.data.userID;

        const result = await botsDAO.createBot(newBot);

        return this.serviceResponseBuilder(result, `Error when inserting bot ${botName} in database.`, 201, newBot);
    }

    async updateBotStatus (botInfo: {botID: string, status: BotStatus})
    {
        botsPropertiesValidator.validateBotStatus(botInfo.status);

        const existentBot = await this.getBotByID(botInfo.botID);
        const result = await botsDAO.updateBotStatus(botInfo.botID, botInfo.status);

        await botsManager.updateBots(result);

        return this.serviceResponseBuilder(result, `Error when updating bot ${existentBot.data.botName}`, 204);
    }

    async deleteBot (botID: string)
    {
        const existentBot = await this.getBotByID(botID);
        const result = await botsDAO.deleteBotByID(existentBot.data.botID);

        await botsManager.updateBots(existentBot.data);

        return this.serviceResponseBuilder(result, `Error when deleting bot ${existentBot.data.botName}.`, 204);
    }

    private getBotName (bot: BotDTO)
    {
        return `${bot.userName}-${bot.account}@${bot.exchange}`;
    }
}

const botsService = new BotsService();
export { botsService };
