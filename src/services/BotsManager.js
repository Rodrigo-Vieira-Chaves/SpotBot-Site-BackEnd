import { BotStatus } from './BotStatus';
import pm2 from 'pm2';

class BotsManager
{
    async updateBots (botsList)
    {
        await this.#promisifiedPM2Connect();
        const bots = Array.isArray(botsList) ? botsList : [ botsList ];

        for (const bot of bots)
        {
            this.#updateBot(bot);
        }
    }

    #updateBot (bot)
    {
        pm2.describe(bot.botName, (err, desc) =>
        {
            this.#processPM2Error(err, 'Describe');

            const botID = desc[0]?.pm_id;
            const statusInPM2 = desc[0]?.pm2_env.status;

            switch (bot.status)
            {
                case BotStatus.IDLE: this.#commandBot(botID, bot.botName, statusInPM2, 'STOP');
                    break;
                case BotStatus.EXECUTING: this.#startBot(bot, statusInPM2);
                    break;
                case BotStatus.STOP_AFTER_TRADE: this.#commandBot(botID, bot.botName, statusInPM2, 'STOP_AFTER_TRADE');
                    break;
                case BotStatus.TO_BE_DELETED:
                    this.#commandBot(botID, statusInPM2, 'STOP');
                    setTimeout(() => pm2.delete(botID), 2500);
                    break;
                default: break;
            }
        });
    }

    // TODO melhorar a resposta para o backend...
    async #commandBot (pm2BotID, botName, statusInPM2, command)
    {
        if (!statusInPM2 || statusInPM2 === 'stopped')
        {
            return;
        }

        const packet =
        {
            type: 'process:msg',
            data:
            {
                command
            },
            topic: true
        };

        const success = await this.#promisifiedPM2SendDataToProcess(pm2BotID, packet);
        console.log(`Bot ${botName} responded command '${command}' with ${success ? 'success' : 'failure'}.`);
    }

    async #startBot (bot, statusInPM2)
    {
        if (statusInPM2 === 'online')
        {
            return;
        }

        const newBotProcess =
        {
            script: '../SpotBot/dist/index.js',
            name: `${bot.botName}`,
            autorestart: false
        };

        pm2.start(newBotProcess, (err, apps) =>
        {
            this.#processPM2Error(err, 'Start');
            console.log(`Bot ${bot.botName} is now executing successfully.`);
        });
    }

    #promisifiedPM2Connect ()
    {
        return new Promise((resolve, reject) =>
        {
            pm2.connect((err) =>
            {
                if (err)
                {
                    this.#processPM2Error(err, 'promisifiedPM2Connect');
                    reject(err);
                }

                resolve();
            });
        });
    }

    #promisifiedPM2SendDataToProcess (pm2BotID, packet)
    {
        return new Promise((resolve, reject) =>
        {
            pm2.sendDataToProcessId(pm2BotID, packet, (err, result) =>
            {
                if (err)
                {
                    this.#processPM2Error(err, 'sendDataToProcessId');
                    reject(err);
                }

                pm2.launchBus((err, pm2_bus) =>
                {
                    if (err)
                    {
                        this.#processPM2Error(err, 'launchBus');
                        reject(err);
                    }

                    pm2_bus.on('process:msg', (packet) =>
                    {
                        resolve(packet.data.success);
                    });
                });
            });
        });
    }

    #processPM2Error (err, functionName)
    {
        if (err)
        {
            console.log(`PM2 '${functionName}' error: ${JSON.stringify(err)}`);
            pm2.disconnect();
            // eslint-disable-next-line no-undef
            process.exit(2);
        }
    }
}

const botsManager = new BotsManager();
export { botsManager };
