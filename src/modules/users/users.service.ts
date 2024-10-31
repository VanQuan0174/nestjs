import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { isValidObjectId, Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { hashPasswordHelper } from '@/helpers/util';
import { isEmail } from 'class-validator';
import { query } from 'express';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  isEmailExist = async (email: string) => {
    const isExist = await this.userModel.exists({ email });
    if (isExist) return true;
    return false;
  };
  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone, address, image } = createUserDto;
    // check email người dùng
    const checkEmail = await this.isEmailExist(email);
    if (checkEmail) {
      throw new BadRequestException(
        `Email đã tồn tại : ${email} - Vui lòng sử dụng email khác`,
      );
    }
    // hash password
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
    });
    return {
      _id: user._id,
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPage = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);
    return { results, totalPage };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(updateUserDto: UpdateUserDto) {
    return this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
  }

  async remove(_id: string) {
    //check id
    if (mongoose.isValidObjectId(_id)) {
      // nếu đúng thì delete
      return this.userModel.deleteOne({ _id });
    } else {
      throw new BadRequestException('id không đúng định dạng mongodb');
    }
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { name, email, password } = registerDto;
    // check email người dùng
    const checkEmail = await this.isEmailExist(email);
    if (checkEmail) {
      throw new BadRequestException(
        `Email đã tồn tại : ${email} - Vui lòng sử dụng email khác`,
      );
    }
    // hash password
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      isActive: false,
      codeId: '',
      codeExpired: new Date(Date.now() + 3600 * 1000),
    });
    //trả ra phản hồi

    //send email
  }
}
