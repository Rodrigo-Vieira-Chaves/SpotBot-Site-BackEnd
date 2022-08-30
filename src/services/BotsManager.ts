import { connect_PM2, delete_PM2, describe_PM2, sendDataToProcess_PM2, start_PM2 } from '../utils/pm2Functions';
import { BotDTO } from '../models/DTOs/BotDTO';
import { BotStatus } from './BotStatus';

class BotsManager
{
    async updateBots (botsList: BotDTO[])
    {
        await connect_PM2();

        for (const bot of botsList) this.updateBot(bot);
    }

    private async updateBot (bot: BotDTO)
    {
        const botProcess = await describe_PM2(bot.botName);

        if (botProcess.length <= 0) return;


        const botID = botProcess[0]?.pm_id as number;
        const statusInPM2 = botProcess[0]?.pm2_env.status as string;

        switch (bot.status)
        {
            case BotStatus.IDLE: this.commandBot(botID, bot.botName as string, statusInPM2, 'STOP');
                break;
            case BotStatus.EXECUTING: this.startBot(bot, statusInPM2);
                break;
            case BotStatus.STOP_AFTER_TRADE: this.commandBot(botID, bot.botName as string, statusInPM2, 'STOP_AFTER_TRADE');
                break;
            case BotStatus.DELETE:
                await this.commandBot(botID, bot.botName as string, statusInPM2, 'STOP');
                await delete_PM2(botID);
                break;
            default: break;
        }
    }

    private async commandBot (botID: number, botName: string, statusInPM2: string, command: 'STOP' | 'STOP_AFTER_TRADE')
    {
        if (!statusInPM2 || statusInPM2 === 'stopped') return;


        const packet =
        {
            type: 'process:msg',
            data:
            {
                command
            },
            topic: true
        };

        const response = await sendDataToProcess_PM2(botID, packet);
        console.log(`Bot ${botName} responded command '${command}' with ${response.success ? 'success' : 'failure'}.`);
    }

    private async startBot (bot: BotDTO, statusInPM2: string)
    {
        if (statusInPM2 === 'online') return;


        const newBotProcess =
        {
            script: '../SpotBot/dist/index.js',
            name: `${bot.botName}`,
            autorestart: false
        };

        await start_PM2(newBotProcess);
        console.log(`Bot ${bot.botName} is now executing successfully.`);
    }
}

const botsManager = new BotsManager();
export { botsManager };
