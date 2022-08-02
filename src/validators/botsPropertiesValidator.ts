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
            this.validateBotStatus.bind(this)
        ];

    validateAll (bot: BotDTO)
    {
        const params = [ bot.exchange, bot.status ];

        this.validateAllProperties(this.allValidators, params);
    }

    validateExchange (exchange: string)
    {
        if (!Object.values(Exchanges).includes(exchange as Exchanges))
        {
            throw new ValidationError(`Exchange can only be one of these values: ${Object.values(Exchanges)}`);
        }
    }

    validateBotStatus (status: string)
    {
        if (!Object.values(BotStatus).includes(status as BotStatus))
        {
            throw new ValidationError(`Bot status can only be one of these values: ${Object.values(BotStatus)}`);
        }
    }

    validateBotAccount (account: string)
    {
        if (!account)
        {
            throw new ValidationError('Account was not provided.');
        }
    }
}

const botsPropertiesValidator = new BotsPropertiesValidator();
export { botsPropertiesValidator };
