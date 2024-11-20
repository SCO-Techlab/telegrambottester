import { ObjectId } from "mongoose";

export interface ITelegramBotToken {
  _id?: string;
  token: string;
  user: ObjectId;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  typeObj?: string;
}
