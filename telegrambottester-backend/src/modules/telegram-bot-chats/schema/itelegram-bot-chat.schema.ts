import { ITelegramBotChat } from '../interface/itelegram-bot-chat.interface';
import { Schema, Types } from 'mongoose';

export const telegramBotChatSchema = new Schema<ITelegramBotChat>(
  {
    chatId: {
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
      default: 'TelegramBotChat',
    },
  },
  {
    timestamps: true,
  },
);

telegramBotChatSchema.index({ user: 1, chatId: -1 }, { unique: true });