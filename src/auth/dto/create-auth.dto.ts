import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'không được bỏ trống email' })
  email: string;

  @IsNotEmpty({ message: 'không được bỏ trống password' })
  password: string;

  @IsOptional()
  name: string;
}
