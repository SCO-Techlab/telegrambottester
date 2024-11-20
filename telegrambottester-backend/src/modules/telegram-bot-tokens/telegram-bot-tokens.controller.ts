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
import { usersConstants } from '../users/constants/user.constants';
import { TelegramBotTokenService } from './telegram-bot-tokens.service';
import { ITelegramBotToken } from './interface/itelegram-bot-token.interface';
import { TelegramBotTokenDto } from './dto/telegram-bot-token.dto';

@Controller('api/v1/telegram-bot-tokens')
@ApiTags('Tokens bot de telegram')
export class TelegramBotTokensController {
  constructor(
    private readonly botTokensService: TelegramBotTokenService,
    private readonly usersService: UsersService,
    private readonly controllerService: ControllerService,
    private readonly websocketsService: WebsocketGateway,
  ) {}

  @Get()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: `Fetch telegram bot tokens`,
    description: 'Devuelve los tokens registrados del bot de telegram, se puede filtrar por parámetros QUERY. Necesaria autorización',
  })
  @ApiQuery({
    description: 'Devuelve los tokens filtrados por una query, si no hay query, devuelve todos',
    type: String,
    required: false,
    name: 'query',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens del bot de telegram devueltos correctamente',
  })
  async fetchTelegramBotTokens(
    @Res() res: Response, 
    @Query() query?: any
  ): Promise<Response<ITelegramBotToken[], Record<string, ITelegramBotToken[]>>> {
    const filter = query && query.query ? await this.controllerService.getParamsFromSwaggerQuery(query.query) : query;

    if (filter.user) {
      const existUser: IUser = await this.usersService.findUserByName(filter.user);
      if (existUser) {
        filter.user = existUser;
      }
    }

    const telegramBotTokens: ITelegramBotToken[] = await this.botTokensService.fetchTelegramBotTokens(filter);
    return res.status(200).json(telegramBotTokens);
  }

  @Post()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: `Add telegram bot token`,
    description: 'Añade un nuevo token a la base de datos. Necesaria autorización',
  })
  @ApiBody({
    description: 'Añadir telegram bot token ejemplo con la clase PermissionDto',
    type: TelegramBotTokenDto,
    examples: {
      a: {
        value: {
          token: '-XXXXXXXXX',
          user: usersConstants.PUBLIC
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token añadido con éxito',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'El token ya existe',
  })
  @ApiResponse({
    status: 500,
    description: 'Imposible crear el token',
  })
  async addTelegramBotToken(@Res() res: Response, @Body() telegramBotToken: TelegramBotTokenDto): Promise<Response<ITelegramBotToken, Record<string, ITelegramBotToken>>> {
    const exist_user: IUser = await this.usersService.findUserByName(telegramBotToken.user.name);
    if (!exist_user) {
      console.log(`[addTelegramBotToken] User not found`);
      throw new HttpException(httpErrorMessages.USERS.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const exist_token: ITelegramBotToken = (await this.botTokensService.findTelegramBotTokensByUser(exist_user.name, telegramBotToken.token))[0];
    if (exist_token) {
      console.log(`[addTelegramBotToken] Telegram bot token not found`);
      throw new HttpException(httpErrorMessages.TELEGRAM_BOT_TOKENS.TELEGRAM_BOT_TOKEN_ALREADY_EXIST, HttpStatus.CONFLICT);
    }

    const savedBotToken: ITelegramBotToken = await this.botTokensService.addTelegramBotToken(telegramBotToken);
    if (savedBotToken) {
      await this.websocketsService.notifyWebsockets(websocketEvents.WS_TELEGRAM_BOT_TOKEN);
    }

    return res.status(200).json(savedBotToken);
  }

  @Put('/:_id')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: `Update telegram bot token`,
    description: 'Actualiza un token existente en la base de datos. Necesaria autorización',
  })
  @ApiParam({
    description: 'Token _id to update',
    type: String,
    required: false,
    name: '_id',
  })
  @ApiBody({
    description: 'Actualizar telegram bot token ejemplo con la clase PermissionDto',
    type: TelegramBotTokenDto,
    examples: {
      a: {
        value: {
          token: '-XXXXXXXXX',
          user: usersConstants.PUBLIC
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Updated token successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Token not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Unnable to update token',
  })
  async updateTelegramBotToken(
    @Res() res: Response, 
    @Param('_id') _id: string, 
    @Body() telegramBotToken: TelegramBotTokenDto
  ): Promise<Response<ITelegramBotToken, Record<string, ITelegramBotToken>>> {
    const exist_telegram_bot_token: ITelegramBotToken = await this.botTokensService.findTelegramBotToken(_id);
    if (!exist_telegram_bot_token) {
      console.log(`[updateTelegramBotToken] Telegram bot token not found`);
      throw new HttpException(httpErrorMessages.TELEGRAM_BOT_TOKENS.TELEGRAM_BOT_TOKEN_NOT_FOUND, HttpStatus.CONFLICT);
    }

    const exist_user: IUser = await this.usersService.findUserByName(telegramBotToken.user.name);
    if (!exist_user) {
      console.log(`[updateTelegramBotToken] User not found`);
      throw new HttpException(httpErrorMessages.USERS.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const exist_token: ITelegramBotToken = (await this.botTokensService.findTelegramBotTokensByUser(exist_user.name, telegramBotToken.token))[0];
    if (exist_token) {
      console.log(`[updateTelegramBotToken] Telegram bot token not found`);
      throw new HttpException(httpErrorMessages.TELEGRAM_BOT_TOKENS.TELEGRAM_BOT_TOKEN_ALREADY_EXIST, HttpStatus.CONFLICT);
    }

    const savedBotToken: ITelegramBotToken = await this.botTokensService.updateTelegramBotToken(_id, telegramBotToken);
    if (savedBotToken) {
      await this.websocketsService.notifyWebsockets(websocketEvents.WS_TELEGRAM_BOT_TOKEN);
    }

    return res.status(200).json(savedBotToken);
  }


  @Delete('/:_id')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: `Delete telegram bot token`,
    description: 'Elimina un token registrado del bot de telegram existente de la aplicación. Necesaria autorización',
  })
  @ApiParam({
    description: 'Id del token del bot de telegram para eliminar',
    type: String,
    required: false,
    name: '_id',
  })
  @ApiResponse({
    status: 200,
    description: 'Token eliminado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Token no encontrado',
  })
  async deleteTelegramBotToken(
    @Res() res: Response, 
    @Param('_id') _id: string
  ): Promise<Response<boolean, Record<string, boolean>>> {
    const existTelegramBotToken: ITelegramBotToken = await this.botTokensService.findTelegramBotToken(_id);
    if (!existTelegramBotToken) {
      console.log(`[deleteTelegramBotToken] Telegram bot token not found`);
      throw new HttpException(httpErrorMessages.TELEGRAM_BOT_TOKENS.TELEGRAM_BOT_TOKEN_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    try {
      const deletedBotToken: boolean = await this.botTokensService.deleteTelegramBotToken(_id);
      if (deletedBotToken) {
        await this.websocketsService.notifyWebsockets(websocketEvents.WS_TELEGRAM_BOT_TOKEN);
      }
      return res.status(200).json(deletedBotToken);
    } catch (error) {
      throw new HttpException(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
