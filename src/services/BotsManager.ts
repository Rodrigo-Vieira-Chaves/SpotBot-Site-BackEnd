import { BotResponse, Messenger } from './Messenger';
import { connect_PM2, delete_PM2, describe_PM2, start_PM2 } from '../utils/pm2Functions';
import { BotDTO } from '../models/DTOs/BotDTO';
import { BotStatus } from './BotStatus';
import { EmptyError } from '../errors/EmptyError';
import { ValidationError } from '../errors/ValidationError';

interface BotMessengers
{
    [botName: string]: Messenger;
}

class BotsManager
{
    private readonly botMessengers = {} as BotMessengers;

    async updateBot (bot: BotDTO)
    {
        await connect_PM2();

        switch (bot.status)
        {
            case BotStatus.IDLE: await this.stopBot(bot, BotStatus.IDLE);
                break;
            case BotStatus.ACTIVE: return this.startBot(bot);
                break;
            case BotStatus.WAITING_PAYMENT:
            case BotStatus.STOP_AFTER_TRADE: await this.stopBot(bot, BotStatus.STOP_AFTER_TRADE);
                break;
            default: throw new ValidationError(`${bot.status} is not a valid status.`);
        }
    }

    private async stopBot (bot: BotDTO, command: BotStatus.IDLE | BotStatus.STOP_AFTER_TRADE)
    {
        const botProcess = await describe_PM2(bot.botName);

        if (botProcess.length <= 0) throw new EmptyError(`${bot.botName} is not initialized in process manager.`);

        const botPM2ID = botProcess[0].pm_id as number;
        const statusInPM2 = botProcess[0].pm2_env.status as string;

        if (statusInPM2 === 'stopped') throw new Error(`${bot.botName} is already ${BotStatus.IDLE} in process manager.`);

        // TODO use redis pub/sub service here
        const packet =
        {
            type: 'process:msg',
            data:
            {
                command
            },
            topic: true
        };

        // const response = await sendDataToProcess_PM2(botPM2ID, packet);
        // console.log(`Bot ${botName} responded command '${command}' with ${response.success ? 'success' : 'failure'}.`);
    }

    private async startBot (bot: BotDTO)
    {
        const botProcess = await describe_PM2(bot.botName);
        const statusInPM2 = botProcess[0]?.pm2_env.status as string;

        if (statusInPM2 === 'online') throw new Error(`${bot.botName} is already ${BotStatus.ACTIVE} in process manager.`);

        const newBotProcess =
        {
            script: '../SpotBot/dist/index.js',
            name: bot.botName,
            autorestart: false,
            args: `${bot.botName} ${bot.apiKey} ${bot.apiSecret}`
        };

        await start_PM2(newBotProcess);

        if (!Object.prototype.hasOwnProperty.call(this.botMessengers, bot.botName)) this.botMessengers[bot.botName] = new Messenger(bot.botName);

        // FIXME take it off after seeing how make bot respond to server that it is ready to receive commands
        await this.sleep(2000);

        return new Promise<BotResponse>((resolve, reject) =>
        {
            this.botMessengers[bot.botName].sendMessageToBot('CHANGE_STATUS', resolve, reject, BotStatus.ACTIVE);
        });
    }

    // FIXME take it off
    sleep (ms: number)
    {
        // eslint-disable-next-line no-promise-executor-return
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

const botsManager = new BotsManager();
export { botsManager };
