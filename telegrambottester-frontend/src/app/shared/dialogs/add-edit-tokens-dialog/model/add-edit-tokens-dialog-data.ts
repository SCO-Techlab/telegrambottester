import { TelegramBotToken } from "src/app/modules/telegram-bot-tokens/model/telegram-bot-token";

export class AddEditTokensDialogoData {
    title: string;
    telegramBotToken?: TelegramBotToken;
}