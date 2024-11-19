import { TelegramBotChat } from "src/app/modules/telegram-bot-chats/model/telegram-bot-chat";

export class AddEditChatsDialogoData {
    title: string;
    telegramBotChat?: TelegramBotChat;
}