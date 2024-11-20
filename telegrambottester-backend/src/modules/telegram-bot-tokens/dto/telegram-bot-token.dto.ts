import { validationErrorMessages } from '../../../constants/validation-error-messages.constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from '../../users/dto/user.dto';

export class TelegramBotTokenDto {
  @ApiProperty()
  @IsOptional()
  @IsString({ message: validationErrorMessages.TELEGRAM_BOT_TOKEN.ID.INVALID_VALUE })
  _id?: string;

  @ApiProperty()
  @IsNotEmpty({ message: validationErrorMessages.TELEGRAM_BOT_TOKEN.TOKEN.NOT_EMPTY })
  @IsString({ message: validationErrorMessages.TELEGRAM_BOT_TOKEN.TOKEN.INVALID_VALUE })
  token: string;

  @ApiProperty()
  @IsNotEmpty({ message: validationErrorMessages.TELEGRAM_BOT_TOKEN.USER.NOT_EMPTY })
  @IsObject({ message: validationErrorMessages.TELEGRAM_BOT_TOKEN.USER.INVALID_VALUE })
  user: UserDto;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: validationErrorMessages.TELEGRAM_BOT_TOKEN.DESCRIPTION.INVALID_VALUE })
  description?: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: validationErrorMessages.TELEGRAM_BOT_TOKEN.CREATED_AT.INVALID_VALUE })
  createdAt?: Date;

  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: validationErrorMessages.TELEGRAM_BOT_TOKEN.UPDATED_AT.INVALID_VALUE })
  updatedAt?: Date;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: validationErrorMessages.TELEGRAM_BOT_TOKEN.TYPE_OBJ.INVALID_VALUE })
  typeObj?: string;
}
