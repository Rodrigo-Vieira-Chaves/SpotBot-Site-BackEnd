import { BotDTO } from '../models/DTOs/BotDTO';
import { Service } from './Service';
import { botsDAO } from '../repositories/DAOs/botsDAO';
import { botsPropertiesValidator } from '../validators/botsPropertiesValidator';

class BotsService extends Service
{
    async getBotByID (botID: string)
    {
        const result = await botsDAO.getBotByID(botID);

        return this.serviceResponseBuilder(result, `Bot ${botID} não existe.`);
    }

    async getBotByUserID (userID: string)
    {
        const result = await botsDAO.getBotByUserID(userID);

        return this.serviceResponseBuilder(result, `Não há nenhum bot cadastrado para o usuário ${userID}.`);
    }

    async getAllBots ()
    {
        const result = await botsDAO.getAllBots();

        return this.serviceResponseBuilder(result, 'Não existem bots cadastrados.');

    }

    async createBot (newBot: BotDTO)
    {
        botsPropertiesValidator.validateAll(newBot);
        const result = await botsDAO.createBot(newBot);

        return this.serviceResponseBuilder(result, 'Erro ao cadastrar bot.', 201, newBot);
    }

    async updateBotStatus (botIDAndStatus: {botID: string, status: string})
    {
        const { botID, status } = botIDAndStatus;
        const result = await botsDAO.updateBotStatus(botID, status);

        return this.serviceResponseBuilder(result, 'Erro ao atualizar bot', 202);
    }
}

const botsService = new BotsService();
export { botsService };
