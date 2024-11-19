import { Inject, Injectable } from "@nestjs/common";
import { ITelegramBotChat } from "./interface/itelegram-bot-chat.interface";
import { Model } from "mongoose";
import { UsersService } from "../users/users.service";
import { TelegramBotChatDto } from "./dto/telegram-bot-chat.dto";
import { IUser } from "../users/interface/iuser.interface";
import { UserDto } from "../users/dto/user.dto";

@Injectable()
export class TelegramBotChatsService {

  constructor(
    @Inject('MODEL') private readonly TelegramBotChatModel: Model<ITelegramBotChat>,
    private readonly usersService: UsersService,
  ) {}

  async fetchTelegramBotChats(where?: any): Promise<ITelegramBotChat[]> {
    try {
      return await this.TelegramBotChatModel.find(where).populate('user');
    } catch (error) {
      console.log(`[fetchTelegramBotChats] Error: ${JSON.stringify(error)}`);
      return [];
    }
  }

  async addTelegramBotChat(telegramBotChat: TelegramBotChatDto): Promise<ITelegramBotChat> {
    try {
      const newTelegramBotChat = new this.TelegramBotChatModel({
        chatId: telegramBotChat.chatId,
        user: telegramBotChat.user,
        description: telegramBotChat.description ? telegramBotChat.description : null,
      });

      const savedTelegramBotChat: ITelegramBotChat = await newTelegramBotChat.save();
      if (!savedTelegramBotChat) {
        console.log(`[addTelegramBotChat] Telegram bot chat: ${savedTelegramBotChat._id} unnable to create`);
        return undefined;
      }
      console.log(`[addTelegramBotChat] Telegram bot chat: ${savedTelegramBotChat._id} created successfully`);

      return savedTelegramBotChat;
    } catch (error) {
      console.log(`[addTelegramBotChat] Error: ${JSON.stringify(error)}`);
      throw new Error(error);
    }
  }

  async updateTelegramBotChat(_id: string, telegramBotChat: TelegramBotChatDto): Promise<ITelegramBotChat> {
    try {
      const result = await this.TelegramBotChatModel.updateOne(
        {
          _id: _id,
        },
        { 
          $set: {
            chatId: telegramBotChat.chatId,
            description: telegramBotChat.description,
          }
        }
      );

      if (!result || (result && result.nModified != 1)) {
        console.log(`[updateTelegramBotChat] Telegram bot chat: ${telegramBotChat.chatId} unnable to update`);
        return undefined;
      }
      console.log(`[updateTelegramBotChat] Telegram bot chat: ${telegramBotChat.chatId} updated successfully`);

      return await this.findTelegramBotChat(_id);
    } catch (error) {
      console.log(`[updateTelegramBotChat] Error: ${JSON.stringify(error)}`);
      throw new Error(error);
    }
  }

  async deleteTelegramBotChat(_id: string): Promise<boolean> {
    try {
      const result = await this.TelegramBotChatModel.deleteOne({ _id });

      if (!result || (result && result.deletedCount != 1)) {
        console.log(`[deleteTelegramBotChat] Telegram Bot Chat: ${_id} unnable to delete`);
        return false;
      }
      console.log(`[deleteTelegramBotChat] Telegram Bot Chat: ${_id} deleted successfully`);

      return true;
    } catch (error) {
      console.log(`[deleteTelegramBotChat] Error: ${JSON.stringify(error)}`);
      throw new Error(error);
    }
  }

  async findTelegramBotChat(_id: string): Promise<ITelegramBotChat> {
    try {
      return await this.TelegramBotChatModel.findOne({ _id: _id }).populate('user');
    } catch (error) {
      console.log(`[findTelegramBotChat] Error: ${JSON.stringify(error)}`);
      return undefined;
    }
  }

  async findTelegramBotChatsByUser(userName: string, chatId: string = undefined): Promise<ITelegramBotChat[]> {
    const existUser: IUser = await this.usersService.findUserByName(userName);
    if (!existUser) {
      return [];
    }

    try {
      const filter: any = { user: existUser };
      if (chatId) filter['chatId'] = chatId;

      return await this.TelegramBotChatModel.find(filter).populate('user');
    } catch (error) {
      console.log(`[findTelegramBotChatsByUser] Error: ${JSON.stringify(error)}`);
      return undefined;
    }
  }
  
  async modelToDto(telegramBotChat: ITelegramBotChat): Promise<TelegramBotChatDto> {
    const user: IUser = await this.usersService.findUserByName(telegramBotChat.user["name"]);
    const userDto: UserDto = await this.usersService.modelToDto(user);

    const telegramBotChatDto: TelegramBotChatDto = {
      _id: telegramBotChat._id ? telegramBotChat._id : undefined, 
      chatId: telegramBotChat.chatId,
      user: userDto,
      description: telegramBotChat.description,
      createdAt: telegramBotChat.createdAt,
      updatedAt: telegramBotChat.updatedAt,
      typeObj: telegramBotChat.typeObj ? telegramBotChat.typeObj : 'TelegramBotChat', 
    }

    return telegramBotChatDto;
  }

}
