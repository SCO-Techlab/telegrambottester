import { User } from "../../users/model/user";

export class TelegramBotToken {
  _id?: string;
  token: string;
  user: User;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  typeObj?: string;
}
