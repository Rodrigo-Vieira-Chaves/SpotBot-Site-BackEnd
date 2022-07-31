import { PropertiesValidator } from './PropertiesValidator';
import { UserDTO } from '../models/DTOs/UserDTO';
import { ValidationError } from '../errors/ValidationError';

class UsersPropertiesValidator extends PropertiesValidator
{
    private readonly nameRegex = /^\s*([A-Za-z]{1,}([.,] |[-']| ))+[A-Za-z]+\.?\s*$/;
    private readonly passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;

    private readonly allValidators =
        [
            this.validateUserName.bind(this),
            this.validatePassword.bind(this)
        ];

    validateAll (user: UserDTO)
    {
        const params = [ user.userName, user.password ];

        this.validateAllProperties(this.allValidators, params);
    }

    validateUserName (userName: string)
    {
        if (userName.length < 2)
        {
            throw new ValidationError('Nome do usuário deve possuir 2 ou mais caracteres.');
        }

        if (!this.nameRegex.test(userName))
        {
            throw new ValidationError('Nome do usuário não pode ter números ou caracteres especiais, exceto: hífen, aspas simples e ponto.');
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
}

const usersPropertiesValidator = new UsersPropertiesValidator();
export { usersPropertiesValidator };
