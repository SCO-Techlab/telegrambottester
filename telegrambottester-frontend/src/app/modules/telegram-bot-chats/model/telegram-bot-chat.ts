import { User } from "../../users/model/user";

export class TelegramBotChat {
  _id?: string;
  chatId: string;
  user: User;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  typeObj?: string;
}
