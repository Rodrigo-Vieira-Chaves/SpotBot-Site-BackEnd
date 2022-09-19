import * as redis from 'redis';
import { BotStatus } from './BotStatus';
import { botsManager } from './BotsManager';

type BackEndCommand = 'CHANGE_STATUS' | 'GET_STATUS';

interface BackEndRequest
{
    botName: string;
    command: BackEndCommand;
    status?: BotStatus;
}

interface BotResponse
{
    botName: string;
    currentStatus: BotStatus;
    errorMessage?: string;
}

class Messenger
{
    public readonly botName;
    public promiseResolve: ((value: BotResponse | PromiseLike<BotResponse>) => void) | undefined;
    public promiseReject: ((reason?: any) => void) | undefined;

    private static readonly publisher = redis.createClient();
    private static readonly subscriber = redis.createClient();

    constructor (botName: string)
    {
        this.botName = botName;
        this.init();
    }

    public async sendMessageToBot (command: BackEndCommand, resolve: (value: BotResponse | PromiseLike<BotResponse>) => void, reject: (reason?: any) => void, status?: BotStatus)
    {
        if (command === 'CHANGE_STATUS' && !status) throw new Error(`The command ${command} requires the status parameter.`);

        this.promiseResolve = resolve;
        this.promiseReject = reject;

        await Messenger.publisher.publish('BACKEND_REQUEST', JSON.stringify({ botName: this.botName, command, status } as BackEndRequest));
    }

    private async init ()
    {
        if (Messenger.publisher.isOpen && Messenger.subscriber.isOpen) return;

        await Messenger.publisher.connect();
        await Messenger.subscriber.connect();

        await Messenger.subscriber.subscribe('BOT_RESPONSE', (message) => botsManager.processBotResponse(JSON.parse(message) as BotResponse));
    }
}

export { Messenger };
export type { BotResponse, BackEndRequest, BackEndCommand };
