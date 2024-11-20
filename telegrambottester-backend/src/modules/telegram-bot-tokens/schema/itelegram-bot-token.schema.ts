import { ITelegramBotToken } from '../interface/itelegram-bot-token.interface';
import { Schema, Types } from 'mongoose';

export const telegramBotTokenSchema = new Schema<ITelegramBotToken>(
  {
    token: {
      type: String,
      required: true,
    },
    user: { 
      type: Types.ObjectId, 
      ref: 'User', 
      required: true,
    },
    description: {
      type: String,
      required: false,
      default: null,
    },
    typeObj: {
      type: String,
      required: false,
      default: 'TelegramBotToken',
    },
  },
  {
    timestamps: true,
  },
);

telegramBotTokenSchema.index({ user: 1, chatId: -1 }, { unique: true });