import { PropertiesValidator } from './PropertiesValidator';
import { UserDTO } from '../models/DTOs/UserDTO';
import { ValidationError } from '../errors/ValidationError';

class UsersPropertiesValidator extends PropertiesValidator
{
//     XQVCwwsDdDd64i1Hl8XTRje8e3_2m3jaC-euCJ9o
// QGODzRIllH3Yhc3fLX5ryepYSjKyJrMWskT8V55M
    private readonly nameRegex = /^([a-z0-9]|[-._](?![-._])){4,10}$/;
    private readonly passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;

    private readonly allValidators =
        [
            this.validateUserName.bind(this),
            this.validatePassword.bind(this),
            this.validateApiKey.bind(this),
            this.validateApiSecret.bind(this)
        ];

    validateAll (user: UserDTO)
    {
        const params = [ user.userName, user.password, user.apiKey, user.apiSecret ];

        this.validateAllProperties(this.allValidators, params);
    }

    validateUserName (userName: string)
    {
        if (!userName || !this.nameRegex.test(userName))
        {
            throw new ValidationError(
                'Nome do usuário deve ser de 4 a 10 caracteres utilizando apenas letras, dígitos e caracteres especiais, sem espaços.');
        }

        if (userName.length < 2)
        {
            throw new ValidationError('Nome do usuário deve possuir 2 ou mais caracteres.');
        }
    }

    validatePassword (password: string)
    {
        if (!this.passwordRegex.test(password))
        {
            throw new ValidationError(
                'Senha deve possuir de 8 a 10 caracteres, começando por letra maiúscula, conter pelo menos um número e um caracter especial.');
        }
    }

    validateApiKey (apiKey: string)
    {
        if (!apiKey)
        {
            throw new ValidationError('ApiKey was not provided.');
        }
    }

    validateApiSecret (apiSecret: string)
    {
        if (!apiSecret)
        {
            throw new ValidationError('ApiSecret was not provided.');
        }
    }
}

const usersPropertiesValidator = new UsersPropertiesValidator();
export { usersPropertiesValidator };
