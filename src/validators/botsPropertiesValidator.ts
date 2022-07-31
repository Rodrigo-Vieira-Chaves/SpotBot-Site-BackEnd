import { BotDTO } from '../models/DTOs/BotDTO';
import { PropertiesValidator } from './PropertiesValidator';
import { ValidationError } from '../errors/ValidationError';

class BotsPropertiesValidator extends PropertiesValidator
{
    private readonly allValidators = [ this.validateBotStatus.bind(this) ];

    validateAll (bot: BotDTO)
    {
        const params = [ bot.status ];

        this.validateAllProperties(this.allValidators, params);
    }

    // TODO update bots statuses
    validateBotStatus (status: string)
    {
        if (status === 'STOP')
        {
            throw new ValidationError('O status do bot só pode conter um dos valores: STOP');
        }
    }
}

const botsPropertiesValidator = new BotsPropertiesValidator();
export { botsPropertiesValidator };
