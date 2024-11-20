import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { UsersService } from "../users/users.service";
import { IUser } from "../users/interface/iuser.interface";
import { UserDto } from "../users/dto/user.dto";
import { ITelegramBotToken } from "./interface/itelegram-bot-token.interface";
import { TelegramBotTokenDto } from "./dto/telegram-bot-token.dto";

@Injectable()
export class TelegramBotTokenService {

  constructor(
    @Inject('MODEL') private readonly TelegramBotTokenModel: Model<ITelegramBotToken>,
    private readonly usersService: UsersService,
  ) {}

  async fetchTelegramBotTokens(where?: any): Promise<ITelegramBotToken[]> {
    try {
      return await this.TelegramBotTokenModel.find(where).populate('user');
    } catch (error) {
      console.log(`[fetchTelegramBotTokens] Error: ${JSON.stringify(error)}`);
      return [];
    }
  }

  async addTelegramBotToken(telegramBotToken: TelegramBotTokenDto): Promise<ITelegramBotToken> {
    try {
      const newTelegramBotToken = new this.TelegramBotTokenModel({
        token: telegramBotToken.token,
        user: telegramBotToken.user,
        description: telegramBotToken.description ? telegramBotToken.description : null,
      });

      const savedTelegramBotToken: ITelegramBotToken = await newTelegramBotToken.save();
      if (!savedTelegramBotToken) {
        console.log(`[addTelegramBotToken] Telegram bot token: ${savedTelegramBotToken._id} unnable to create`);
        return undefined;
      }
      console.log(`[addTelegramBotToken] Telegram bot token: ${savedTelegramBotToken._id} created successfully`);

      return savedTelegramBotToken;
    } catch (error) {
      console.log(`[addTelegramBotToken] Error: ${JSON.stringify(error)}`);
      throw new Error(error);
    }
  }

  async updateTelegramBotToken(_id: string, telegramBotToken: TelegramBotTokenDto): Promise<ITelegramBotToken> {
    try {
      const result = await this.TelegramBotTokenModel.updateOne(
        {
          _id: _id,
        },
        { 
          $set: {
            token: telegramBotToken.token,
            description: telegramBotToken.description,
          }
        }
      );

      if (!result || (result && result.nModified != 1)) {
        console.log(`[updateTelegramBotToken] Telegram bot token: ${telegramBotToken.token} unnable to update`);
        return undefined;
      }
      console.log(`[updateTelegramBotToken] Telegram bot token: ${telegramBotToken.token} updated successfully`);

      return await this.findTelegramBotToken(_id);
    } catch (error) {
      console.log(`[updateTelegramBotToken] Error: ${JSON.stringify(error)}`);
      throw new Error(error);
    }
  }

  async deleteTelegramBotToken(_id: string): Promise<boolean> {
    try {
      const result = await this.TelegramBotTokenModel.deleteOne({ _id });

      if (!result || (result && result.deletedCount != 1)) {
        console.log(`[deleteTelegramBotToken] Telegram Bot token: ${_id} unnable to delete`);
        return false;
      }
      console.log(`[deleteTelegramBotToken] Telegram Bot token: ${_id} deleted successfully`);

      return true;
    } catch (error) {
      console.log(`[deleteTelegramBotToken] Error: ${JSON.stringify(error)}`);
      throw new Error(error);
    }
  }

  async findTelegramBotToken(_id: string): Promise<ITelegramBotToken> {
    try {
      return await this.TelegramBotTokenModel.findOne({ _id: _id }).populate('user');
    } catch (error) {
      console.log(`[findTelegramBotToken] Error: ${JSON.stringify(error)}`);
      return undefined;
    }
  }

  async findTelegramBotTokensByUser(userName: string, token: string = undefined): Promise<ITelegramBotToken[]> {
    const existUser: IUser = await this.usersService.findUserByName(userName);
    if (!existUser) {
      return [];
    }

    try {
      const filter: any = { user: existUser };
      if (token) filter['token'] = token;

      return await this.TelegramBotTokenModel.find(filter).populate('user');
    } catch (error) {
      console.log(`[findTelegramBotTokensByUser] Error: ${JSON.stringify(error)}`);
      return undefined;
    }
  }
  
  async modelToDto(telegramBotToken: ITelegramBotToken): Promise<TelegramBotTokenDto> {
    const user: IUser = await this.usersService.findUserByName(telegramBotToken.user["name"]);
    const userDto: UserDto = await this.usersService.modelToDto(user);

    const telegramBotTokenDto: TelegramBotTokenDto = {
      _id: telegramBotToken._id ? telegramBotToken._id : undefined, 
      token: telegramBotToken.token,
      user: userDto,
      description: telegramBotToken.description,
      createdAt: telegramBotToken.createdAt,
      updatedAt: telegramBotToken.updatedAt,
      typeObj: telegramBotToken.typeObj ? telegramBotToken.typeObj : 'TelegramBotToken', 
    }

    return telegramBotTokenDto;
  }

}
