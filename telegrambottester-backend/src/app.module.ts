import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TelegramBotModule } from './modules/telegram-bot/telegram-bot.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configurationApp } from './configuration/configuration-app';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { WebsocketConfig } from './modules/websocket/config/websocket-config';
import { configurationMongo } from './configuration/configuration-mongo';
import { MongoDbModule } from './modules/mongo-db/mongo-db.module';
import { MongoDbConfig } from './modules/mongo-db/mongo-db-config';
import { UsersModule } from './modules/users/users.module';
import { configurationEmailer } from './configuration/configuration-emailer';
import { EmailerModule } from './modules/emailer/emailer.module';
import { EmailerConfig } from './modules/emailer/config/emailer-config';
import { configurationAuth } from './configuration/configuration-auth';
import { AuthModule } from './modules/auth/auth.module';
import { AuthConfig } from './modules/auth/config/auth.config';
import { TelegramBotResultsModule } from './modules/telegram-bot-results/telegram-bot-results.module';
import { PublicMiddleware } from './middlewares/public.middleware';
import { LoggerService } from './app.logger.service';
import { TelegramBotChatsModule } from './modules/telegram-bot-chats/telegram-bot-chats.module';
import { TelegramBotTokensModule } from './modules/telegram-bot-tokens/telegram-bot-tokens.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        configurationApp,
        configurationMongo,
        configurationEmailer,
        configurationAuth,
      ],
      envFilePath: `./env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    WebsocketModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const websocketConfig: WebsocketConfig = {
          port: configService.get('app.port'),
        };
        return websocketConfig;
      },
      inject: [ConfigService],
    }),
    MongoDbModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const mongoDB: MongoDbConfig = {
          ip: configService.get('mongo.host'),
          port: configService.get('mongo.port'),
          database: configService.get('mongo.database'),
          user: configService.get('mongo.user'),
          pass: configService.get('mongo.password'),
        };
        return mongoDB;
      },
      inject: [ConfigService],
    }),
    EmailerModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const emailerConfig: EmailerConfig = {
          sending_Email_Address: configService.get("emailer.address"),
          sending_Email_Password: configService.get("emailer.password"),
          service: configService.get("emailer.service"),
        };
        return emailerConfig;
      },
      inject: [ConfigService],
    }),
    AuthModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const authConfig: AuthConfig = {
          secret: configService.get('auth.secret'),
          signOptions: { expiresIn: configService.get('auth.expiresIn') },
        };
        return authConfig;
      },
      inject: [ConfigService],
    }),
    UsersModule,
    TelegramBotModule,
    TelegramBotResultsModule,
    TelegramBotChatsModule,
    TelegramBotTokensModule,
  ],
  providers: [
    LoggerService,
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(PublicMiddleware).forRoutes("*");
  }
}