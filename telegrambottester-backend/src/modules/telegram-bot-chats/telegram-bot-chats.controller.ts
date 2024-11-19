import { httpErrorMessages } from '../../constants/http-error-messages.constants';
import { IUser } from 'src/modules/users/interface/iuser.interface';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsersService } from "../users/users.service";
import { ControllerService } from "../shared/controller/controller.service";
import { WebsocketGateway } from "../websocket/websocket.gateway";
import { AuthGuard } from "@nestjs/passport";
import { Response } from 'express';
import { websocketEvents } from '../websocket/constants/websocket.events';
import { TelegramBotChatsService } from './telegram-bot-chats.service';
import { ITelegramBotChat } from './interface/itelegram-bot-chat.interface';
import { TelegramBotChatDto } from './dto/telegram-bot-chat.dto';
import { usersConstants } from '../users/constants/user.constants';

@Controller('api/v1/telegram-bot-chats')
@ApiTags('Chats bot de telegram')
export class TelegramBotChatsController {
  constructor(
    private readonly botChatsService: TelegramBotChatsService,
    private readonly usersService: UsersService,
    private readonly controllerService: ControllerService,
    private readonly websocketsService: WebsocketGateway,
  ) {}

  @Get()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: `Fetch telegram bot chats`,
    description: 'Devuelve los chats registrados del bot de telegram, se puede filtrar por parámetros QUERY. Necesaria autorización',
  })
  @ApiQuery({
    description: 'Devuelve los usuarios filtrados por una query, si no hay query, devuelve todos',
    type: String,
    required: false,
    name: 'query',
  })
  @ApiResponse({
    status: 200,
    description: 'Chats del bot de telegram devueltos correctamente',
  })
  async fetchTelegramBotChats(
    @Res() res: Response, 
    @Query() query?: any
  ): Promise<Response<ITelegramBotChat[], Record<string, ITelegramBotChat[]>>> {
    const filter = query && query.query ? await this.controllerService.getParamsFromSwaggerQuery(query.query) : query;

    if (filter.user) {
      const existUser: IUser = await this.usersService.findUserByName(filter.user);
      if (existUser) {
        filter.user = existUser;
      }
    }

    const telegramBotChats: ITelegramBotChat[] = await this.botChatsService.fetchTelegramBotChats(filter);
    return res.status(200).json(telegramBotChats);
  }

  @Post()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: `Add telegram bot chat`,
    description: 'Añade un nuevo chat a la base de datos. Necesaria autorización',
  })
  @ApiBody({
    description: 'Añadir telegram bot chat ejemplo con la clase PermissionDto',
    type: TelegramBotChatDto,
    examples: {
      a: {
        value: {
          chatId: '-XXXXXXXXX',
          user: usersConstants.PUBLIC
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Chat añadido con éxito',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'El chat ya existe',
  })
  @ApiResponse({
    status: 500,
    description: 'Imposible crear el chat',
  })
  async addTelegramBotChat(@Res() res: Response, @Body() telegramBotChat: TelegramBotChatDto): Promise<Response<ITelegramBotChat, Record<string, ITelegramBotChat>>> {
    const exist_user: IUser = await this.usersService.findUserByName(telegramBotChat.user.name);
    if (!exist_user) {
      console.log(`[addTelegramBotChat] User not found`);
      throw new HttpException(httpErrorMessages.USERS.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const exist_chat: ITelegramBotChat = (await this.botChatsService.findTelegramBotChatsByUser(exist_user.name, telegramBotChat.chatId))[0];
    if (exist_chat) {
      console.log(`[addTelegramBotChat] Telegram bot chat not found`);
      throw new HttpException(httpErrorMessages.TELEGRAM_BOT_CHATS.TELEGRAM_BOT_CHAT_ALREADY_EXIST, HttpStatus.CONFLICT);
    }

    const savedBotChat: ITelegramBotChat = await this.botChatsService.addTelegramBotChat(telegramBotChat);
    if (savedBotChat) {
      await this.websocketsService.notifyWebsockets(websocketEvents.WS_TELEGRAM_BOT_CHAT);
    }

    return res.status(200).json(savedBotChat);
  }

  @Put('/:_id')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: `Update telegram bot chat`,
    description: 'Actualiza un chat existente en la base de datos. Necesaria autorización',
  })
  @ApiParam({
    description: 'Chat _id to update',
    type: String,
    required: false,
    name: '_id',
  })
  @ApiBody({
    description: 'Actualizar telegram bot chat ejemplo con la clase PermissionDto',
    type: TelegramBotChatDto,
    examples: {
      a: {
        value: {
          chatId: '-XXXXXXXXX',
          user: usersConstants.PUBLIC
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Updated permission successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Permission name already exist',
  })
  @ApiResponse({
    status: 500,
    description: 'Unnable to update permission',
  })
  async updateTelegramBotChat(
    @Res() res: Response, 
    @Param('_id') _id: string, 
    @Body() telegramBotChat: TelegramBotChatDto
  ): Promise<Response<ITelegramBotChat, Record<string, ITelegramBotChat>>> {
    const exist_telegram_bot_chat: ITelegramBotChat = await this.botChatsService.findTelegramBotChat(_id);
    if (!exist_telegram_bot_chat) {
      console.log(`[updateTelegramBotChat] Telegram bot chat not found`);
      throw new HttpException(httpErrorMessages.TELEGRAM_BOT_CHATS.TELEGRAM_BOT_CHAT_NOT_FOUND, HttpStatus.CONFLICT);
    }

    const exist_user: IUser = await this.usersService.findUserByName(telegramBotChat.user.name);
    if (!exist_user) {
      console.log(`[updateTelegramBotChat] User not found`);
      throw new HttpException(httpErrorMessages.USERS.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const exist_chat: ITelegramBotChat = (await this.botChatsService.findTelegramBotChatsByUser(exist_user.name, telegramBotChat.chatId))[0];
    if (exist_chat) {
      console.log(`[updateTelegramBotChat] Telegram bot chat not found`);
      throw new HttpException(httpErrorMessages.TELEGRAM_BOT_CHATS.TELEGRAM_BOT_CHAT_ALREADY_EXIST, HttpStatus.CONFLICT);
    }

    const savedBotChat: ITelegramBotChat = await this.botChatsService.updateTelegramBotChat(_id, telegramBotChat);
    if (savedBotChat) {
      await this.websocketsService.notifyWebsockets(websocketEvents.WS_TELEGRAM_BOT_CHAT);
    }

    return res.status(200).json(savedBotChat);
  }


  @Delete('/:_id')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: `Delete telegram bot chat`,
    description: 'Elimina un chat registrado del bot de telegram existente de la aplicación. Necesaria autorización',
  })
  @ApiParam({
    description: 'Id del chat del bot de telegram para eliminar',
    type: String,
    required: false,
    name: '_id',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat eliminado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Chat no encontrado',
  })
  async deleteTelegramBotChat(
    @Res() res: Response, 
    @Param('_id') _id: string
  ): Promise<Response<boolean, Record<string, boolean>>> {
    const existTelegramBotChat: ITelegramBotChat = await this.botChatsService.findTelegramBotChat(_id);
    if (!existTelegramBotChat) {
      console.log(`[deleteTelegramBotChat] Telegram bot chat not found`);
      throw new HttpException(httpErrorMessages.TELEGRAM_BOT_CHATS.TELEGRAM_BOT_CHAT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    try {
      const deletedBotChat: boolean = await this.botChatsService.deleteTelegramBotChat(_id);
      if (deletedBotChat) {
        await this.websocketsService.notifyWebsockets(websocketEvents.WS_TELEGRAM_BOT_CHAT);
      }
      return res.status(200).json(deletedBotChat);
    } catch (error) {
      throw new HttpException(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
