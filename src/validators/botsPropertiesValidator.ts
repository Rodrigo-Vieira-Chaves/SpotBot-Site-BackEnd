import { BotDTO } from '../models/DTOs/BotDTO';
import { BotStatus } from '../services/BotStatus';
import { Exchanges } from '../services/Exchanges';
import { PropertiesValidator } from './PropertiesValidator';
import { ValidationError } from '../errors/ValidationError';

class BotsPropertiesValidator extends PropertiesValidator
{
    private readonly allValidators =
        [
            this.validateExchange.bind(this),
            this.validateBotStatus.bind(this),
            this.validateBotAccount.bind(this),
            this.validateApiKey.bind(this),
            this.validateApiSecret.bind(this)
        ];

    validateAll (bot: BotDTO)
    {
        const params = [ bot.exchange, bot.status, bot.account, bot.apiKey, bot.apiSecret ];

        this.validateAllProperties(this.allValidators, params);
    }

    validateExchange (exchange: string)
    {
        if (!Object.values(Exchanges).includes(exchange as Exchanges)) throw new ValidationError(`Exchange can only be one of these values: ${Object.values(Exchanges)}`);
    }

    validateBotStatus (status: string)
    {
        if (!Object.values(BotStatus).includes(status as BotStatus)) throw new ValidationError(`Bot status can only be one of these values: ${Object.values(BotStatus)}`);
    }

    validateBotAccount (account: string)
    {
        if (!account) throw new ValidationError('Account was not provided.');
    }

    validateApiKey (apiKey: string)
    {
        if (!apiKey) throw new ValidationError('ApiKey was not provided.');
    }

    validateApiSecret (apiSecret: string)
    {
        if (!apiSecret) throw new ValidationError('ApiSecret was not provided.');
    }
}

const botsPropertiesValidator = new BotsPropertiesValidator();
export { botsPropertiesValidator };
