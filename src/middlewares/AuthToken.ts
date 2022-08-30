import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { apiResponseBuilder } from '../responses/APIResponseBuilder';

class AuthToken
{
    public readonly tokenExpirationTime = 60 * 15;

    generateToken (payload: string | object | Buffer)
    {
        return jwt.sign({ payload }, process.env.JWT_KEY as Secret, { expiresIn: this.tokenExpirationTime });
    }

    verifyToken (token: string)
    {
        try
        {
            return jwt.verify(token, process.env.JWT_KEY as Secret) as string;
        }
        catch (error: any)
        {
            throw new UnauthorizedError('Token Invalid/Expired.');
        }
    }

    validateToken (req: Request, res: Response, next: NextFunction)
    {
        const token = req.headers.authorization?.split(' ')[1];

        const clientCPF = req.body.clientCPF || req.body.source?.clientCPF || req.params.cpf;
        const password = req.body.account?.password || req.body.source?.account.password;

        try
        {
            const payload = jwt.verify(token as string, process.env.JWT_KEY as Secret) as JwtPayload;

            const isCPFValid = payload.clientCPF === clientCPF;
            const isPasswordValid = password ? payload.password === password : true;

            if (isCPFValid && isPasswordValid) return next();
            throw new UnauthorizedError('Credenciais inválidas.');
        }
        catch (error: any)
        {
            error.message = error.message === 'jwt expired' ? 'Token expirado' : error.message;
            const apiResponse = apiResponseBuilder.writeErrorResponse(error);

            return res.status(apiResponse.code).json(apiResponse);
        }
    }
}

const authToken = new AuthToken();
export { authToken };
