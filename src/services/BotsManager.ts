import { BackEndCommand, BotResponse, Messenger } from './Messenger';
import { connect_PM2, delete_PM2, describe_PM2, start_PM2 } from '../utils/pm2Functions';
import { BotDTO } from '../models/DTOs/BotDTO';
import { BotStatus } from './BotStatus';
import { EmptyError } from '../errors/EmptyError';
import { ValidationError } from '../errors/ValidationError';
import { botsService } from './botsService';

interface BotMessengers
{
    [botName: string]: Messenger;
}

class BotsManager
{
    private readonly botMessengers = {} as BotMessengers;

    async startBot (bot: BotDTO)
    {
        await connect_PM2();

        const botProcess = await describe_PM2(bot.botName);
        const statusInPM2 = botProcess[0]?.pm2_env.status as string;

        if (statusInPM2 === 'online')
        {
            const botCurrentStatus = await this.sendMessageSyncToBot(bot.botName, 'GET_STATUS');

            if (botCurrentStatus.currentStatus === BotStatus.ACTIVE) throw new Error(`${bot.botName} is already ${BotStatus.ACTIVE}.`);

            return this.sendMessageSyncToBot(bot.botName, 'CHANGE_STATUS', BotStatus.ACTIVE);
        }

        const newBotProcess =
        {
            script: '../SpotBot/dist/index.js',
            name: bot.botName,
            autorestart: false,
            args: `${bot.botName} ${bot.apiKey} ${bot.apiSecret}`
        };

        await start_PM2(newBotProcess);

        if (!Object.prototype.hasOwnProperty.call(this.botMessengers, bot.botName)) this.botMessengers[bot.botName] = new Messenger(bot.botName);

        return this.sendMessageSyncToBot(bot.botName, 'CHANGE_STATUS', BotStatus.ACTIVE);
    }

    async makeBotIdleOrStopAfterTrade (bot: BotDTO)
    {
        // eslint-disable-next-line max-len
        if (bot.status !== BotStatus.IDLE && bot.status !== BotStatus.STOP_AFTER_TRADE) throw new ValidationError(`Bot status must be either ${BotStatus.IDLE} or ${BotStatus.STOP_AFTER_TRADE} in function 'makeBotIdleOrStopAfterTrade'`);

        await connect_PM2();

        const botProcess = await describe_PM2(bot.botName);

        if (botProcess.length <= 0) throw new EmptyError(`${bot.botName} is not initialized.`);

        const statusInPM2 = botProcess[0].pm2_env.status as string;

        if (statusInPM2 === 'stopped') throw new Error(`${bot.botName} is ${BotStatus.IDLE}.`);

        return this.sendMessageSyncToBot(bot.botName, 'CHANGE_STATUS', bot.status);
    }

    async deleteBot (bot: BotDTO)
    {
        await connect_PM2();

        const botProcess = await describe_PM2(bot.botName);

        if (botProcess.length <= 0) return Promise.resolve();

        const statusInPM2 = botProcess[0].pm2_env.status as string;

        if (statusInPM2 === 'online') throw new Error(`${bot.botName} is active, make it ${BotStatus.IDLE} before deleting it.`);

        return delete_PM2(botProcess[0].pm_id);
    }

    async processBotResponse (response: BotResponse)
    {
        const messenger = this.botMessengers[response.botName];

        if (!messenger.promiseResolve)
        {
            botsService.processBotsAsyncMessage(response);

            return;
        }

        const resolve = messenger.promiseResolve;
        const reject = messenger.promiseReject;

        messenger.promiseReject = undefined;
        messenger.promiseResolve = undefined;

        if (response.errorMessage)
        {
            if (reject) reject(new Error(response.errorMessage));

            return;
        }

        if (resolve) resolve(response);
    }

    private sendMessageSyncToBot (botName: string, command: BackEndCommand, status?: BotStatus)
    {
        return new Promise<BotResponse>((resolve, reject) =>
        {
            this.botMessengers[botName].sendMessageToBot(command, resolve, reject, status);
        });
    }
}

const botsManager = new BotsManager();
export { botsManager };
