import { TelegramBotToken } from "../model/telegram-bot-token";

export class FetchTelegramBotTokens {
    static readonly type = '[TelegramBotChats] Fetch telegram bot tokens';
    constructor(public payload: { filter?: any }) {}
}

export class AddTelegramBotToken {
    static readonly type = '[TelegramBotChats] Add telegram bot tokens';
    constructor(public payload: { telegramBotToken: TelegramBotToken } ) {}
}

export class UpdateTelegramBotToken {
    static readonly type = '[TelegramBotChats] Update telegram bot tokens';
    constructor(public payload: { _id: string, telegramBotToken: TelegramBotToken } ) {}
}

export class DeleteTelegramBotToken {
    static readonly type = '[TelegramBotChats] Delete telegram bot tokens';
    constructor(public payload: { _id: string } ) {}
}

export class SubscribeTelegramBotTokensWS {
    static readonly type = '[TelegramBotChats] Subscribe telegram bot tokens WS'
}

export class UnSubscribeTelegramBotTokensWS {
    static readonly type = '[TelegramBotChats] UnSubscribe telegram bot tokens WS';
}