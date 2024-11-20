import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { SharedModule } from "../shared/shared.module";
import { UsersModule } from "../users/users.module";
import { TelegramBotTokenService } from "./telegram-bot-tokens.service";
import { MongoDbService } from "../mongo-db/mongo-db.service";
import { ITelegramBotToken } from "./interface/itelegram-bot-token.interface";
import { telegramBotTokenSchema } from "./schema/itelegram-bot-token.schema";
import { TelegramBotTokensController } from "./telegram-bot-tokens.controller";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    SharedModule,
    UsersModule,
  ],
  controllers: [TelegramBotTokensController],
  providers: [
    TelegramBotTokenService,
      {
          provide: 'MODEL',
          useFactory: (db: MongoDbService) =>
          db.getConnection().model<ITelegramBotToken>('TelegramBotToken', telegramBotTokenSchema, 'telegram-bot-tokens'),
          inject: [MongoDbService],
      },
  ],
  exports: [TelegramBotTokenService],
})
export class TelegramBotTokensModule { }
