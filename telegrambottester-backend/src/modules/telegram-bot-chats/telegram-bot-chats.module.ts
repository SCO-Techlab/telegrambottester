import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { SharedModule } from "../shared/shared.module";
import { UsersModule } from "../users/users.module";
import { TelegramBotChatsService } from "./telegram-bot-chats.service";
import { MongoDbService } from "../mongo-db/mongo-db.service";
import { ITelegramBotChat } from "./interface/itelegram-bot-chat.interface";
import { telegramBotChatSchema } from "./schema/itelegram-bot-chat.schema";
import { TelegramBotChatsController } from "./telegram-bot-chats.controller";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    SharedModule,
    UsersModule,
  ],
  controllers: [TelegramBotChatsController],
  providers: [
      TelegramBotChatsService,
      {
          provide: 'MODEL',
          useFactory: (db: MongoDbService) =>
          db.getConnection().model<ITelegramBotChat>('TelegramBotChat', telegramBotChatSchema, 'telegram-bot-chats'),
          inject: [MongoDbService],
      },
  ],
  exports: [TelegramBotChatsService],
})
export class TelegramBotChatsModule { }
