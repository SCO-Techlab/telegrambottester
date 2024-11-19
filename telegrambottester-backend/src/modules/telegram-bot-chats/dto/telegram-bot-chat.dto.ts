import { validationErrorMessages } from '../../../constants/validation-error-messages.constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from '../../users/dto/user.dto';

export class TelegramBotChatDto {
  @ApiProperty()
  @IsOptional()
  @IsString({ message: validationErrorMessages.TELEGRAM_BOT_CHAT.ID.INVALID_VALUE })
  _id?: string;

  @ApiProperty()
  @IsNotEmpty({ message: validationErrorMessages.TELEGRAM_BOT_CHAT.CHAT_ID.NOT_EMPTY })
  @IsString({ message: validationErrorMessages.TELEGRAM_BOT_CHAT.CHAT_ID.INVALID_VALUE })
  chatId: string;

  @ApiProperty()
  @IsNotEmpty({ message: validationErrorMessages.TELEGRAM_BOT_CHAT.USER.NOT_EMPTY })
  @IsObject({ message: validationErrorMessages.TELEGRAM_BOT_CHAT.USER.INVALID_VALUE })
  user: UserDto;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: validationErrorMessages.TELEGRAM_BOT_CHAT.DESCRIPTION.INVALID_VALUE })
  description?: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: validationErrorMessages.TELEGRAM_BOT_CHAT.CREATED_AT.INVALID_VALUE })
  createdAt?: Date;

  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: validationErrorMessages.TELEGRAM_BOT_CHAT.UPDATED_AT.INVALID_VALUE })
  updatedAt?: Date;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: validationErrorMessages.TELEGRAM_BOT_CHAT.TYPE_OBJ.INVALID_VALUE })
  typeObj?: string;
}
