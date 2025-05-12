import { PartialType } from '@nestjs/mapped-types'
import { IsEmail, IsOptional, IsString } from 'class-validator'

export class CreateUserDto {
  @IsString()
  name: string

  @IsEmail()
  email: string

  @IsString()
  password: string

  @IsString()
  @IsOptional()
  bio?: string

  @IsString()
  @IsOptional()
  profileImage?: string

  @IsString()
  @IsOptional()
  google_id?: string
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
