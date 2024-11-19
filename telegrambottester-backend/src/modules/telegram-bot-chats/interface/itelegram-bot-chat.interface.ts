import { ObjectId } from "mongoose";

export interface ITelegramBotChat {
  _id?: string;
  chatId: string;
  user: ObjectId;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  typeObj?: string;
}
