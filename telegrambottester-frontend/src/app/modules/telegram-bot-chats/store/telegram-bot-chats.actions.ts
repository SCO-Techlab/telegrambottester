import { TelegramBotChat } from "../model/telegram-bot-chat";

export class FetchTelegramBotChats {
    static readonly type = '[TelegramBotChats] Fetch telegram bot chats';
    constructor(public payload: { filter?: any }) {}
}

export class AddTelegramBotChat {
    static readonly type = '[TelegramBotChats] Add telegram bot chats';
    constructor(public payload: { telegramBotChat: TelegramBotChat } ) {}
}

export class UpdateTelegramBotChat {
    static readonly type = '[TelegramBotChats] Update telegram bot chats';
    constructor(public payload: { _id: string, telegramBotChat: TelegramBotChat } ) {}
}

export class DeleteTelegramBotChat {
    static readonly type = '[TelegramBotChats] Delete telegram bot chats';
    constructor(public payload: { _id: string } ) {}
}

export class SubscribeTelegramBotChatsWS {
    static readonly type = '[TelegramBotChats] Subscribe telegram bot chats WS'
}

export class UnSubscribeTelegramBotChatsWS {
    static readonly type = '[TelegramBotChats] UnSubscribe telegram bot chats WS';
}