import { BotStatus } from '../../services/BotStatus';
import { Exchanges } from '../../services/Exchanges';

interface BotDTO
{
  botID?: string;
  userID?: string;
  userName?: string;
  botName: string;
  exchange: Exchanges;
  status: BotStatus;
  account: string;
  apiKey?: string;
  apiSecret?: string;
}

export { BotDTO };
