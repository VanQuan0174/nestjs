import { IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'không được bỏ trống username' })
  username: string;

  @IsNotEmpty({ message: 'không được bỏ trống password' })
  password: string;
}
