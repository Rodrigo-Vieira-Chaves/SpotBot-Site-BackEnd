import { BotDTO } from '../models/DTOs/BotDTO';
import { BotResponse } from './Messenger';
import { BotStatus } from './BotStatus';
import { Service } from './Service';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { ValidationError } from '../errors/ValidationError';
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

    async getBotByBotName (botName: string)
    {
        const result = await botsDAO.getBotByBotName(botName);

        return this.serviceResponseBuilder(result, `Bot ${botName} does not exist.`);
    }

    async getBotsByUsername (userName: string)
    {
        const user = await usersService.getUserByUserName(userName);
        const result = await botsDAO.getBotsByUserID(user.data.userID);

        return this.serviceResponseBuilder(result, `User ${userName} has no bots created.`);
    }

    async createBot (bot: BotDTO)
    {
        const newBot = bot;
        newBot.status = BotStatus.IDLE;
        newBot.account = newBot.account ? newBot.account : 'main';

        botsPropertiesValidator.validateAll(newBot);

        const user = await usersService.getUserByUserName(newBot.userName as string);

        const botName = this.getBotName(bot);

        newBot.botName = botName;
        newBot.userID = user.data.userID;

        // TODO change api key and secret to be registered at user register page, it will be made only once and used to all user's bots.
        let existentBot = await botsDAO.getBotByBotName(botName);
        if (existentBot.length > 0) throw new UnauthorizedError('A bot with same exchange and account already exists.');

        existentBot = await botsDAO.getBotsByApiKeyOrSecret(newBot.apiKey as string);
        if (existentBot.length > 0) throw new UnauthorizedError('A bot with same ApiKey already exists.');

        existentBot = await botsDAO.getBotsByApiKeyOrSecret(newBot.apiSecret as string);
        if (existentBot.length > 0) throw new UnauthorizedError('A bot with same ApiSecret already exists.');

        const result = await botsDAO.createBot(newBot);

        return this.serviceResponseBuilder(result, `Error when inserting bot ${botName} in database.`, 201);
    }

    async startBot (bot: BotDTO)
    {
        botsPropertiesValidator.validateExchange(bot.exchange);
        botsPropertiesValidator.validateBotAccount(bot.account);

        const existentBot = (await this.getBotByBotName(this.getBotName(bot))).data as BotDTO;

        if (existentBot.status === BotStatus.ACTIVE) throw new ValidationError(`${existentBot.botName} is already in status ${BotStatus.ACTIVE}.`);

        const response = await botsManager.startBot(existentBot);

        const result = await botsDAO.updateBotStatus(existentBot.botID as string, response.currentStatus);

        return this.serviceResponseBuilder(result, `Error when updating bot ${existentBot.botName}`);
    }

    async makeBotIdleOrStopAfterTrade (bot: BotDTO)
    {
        botsPropertiesValidator.validateBotStatus(bot.status);
        botsPropertiesValidator.validateExchange(bot.exchange);
        botsPropertiesValidator.validateBotAccount(bot.account);

        const existentBot = (await this.getBotByBotName(this.getBotName(bot))).data as BotDTO;

        if (bot.status === existentBot.status) throw new ValidationError(`${existentBot.botName} is already in status ${existentBot.status}.`);

        existentBot.status = bot.status;

        const response = await botsManager.makeBotIdleOrStopAfterTrade(existentBot);

        const result = await botsDAO.updateBotStatus(existentBot.botID as string, response.currentStatus);

        return this.serviceResponseBuilder(result, `Error when updating bot ${existentBot.botName}`);
    }

    async deleteBot (bot: BotDTO)
    {
        botsPropertiesValidator.validateExchange(bot.exchange);
        botsPropertiesValidator.validateBotAccount(bot.account);

        const existentBot = (await this.getBotByBotName(this.getBotName(bot))).data as BotDTO;

        // eslint-disable-next-line max-len
        if (existentBot.status !== BotStatus.IDLE && existentBot.status !== BotStatus.ERROR) throw new UnauthorizedError(`A bot can be deleted only when it's in ${BotStatus.IDLE} or ${BotStatus.ERROR} status.`);

        await botsManager.deleteBot(existentBot);

        const result = await botsDAO.deleteBotByID(existentBot.botID as string);

        return this.serviceResponseBuilder(result, `Error when deleting bot ${existentBot.botName}.`);
    }

    async processBotsAsyncMessage (response: BotResponse)
    {
        const existentBot = (await this.getBotByBotName(response.botName)).data as BotDTO;

        if (response.currentStatus === existentBot.status) return;

        const result = await botsDAO.updateBotStatus(existentBot.botID as string, response.currentStatus);

        // TODO put a log here...
    }

    private getBotName (bot: BotDTO)
    {
        return `${bot.userName}@${bot.exchange}.${bot.account}`;
    }
}

const botsService = new BotsService();
export { botsService };
