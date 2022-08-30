import { BotStatus } from '../../services/BotStatus';
import { Exchanges } from '../../services/Exchanges';

interface BotDTO
{
  botID?: string;
  userID?: string;
  botName?: string;
  userName: string;
  exchange: Exchanges;
  account: string;
  status: BotStatus;
}

export { BotDTO };
