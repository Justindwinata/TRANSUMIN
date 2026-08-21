import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async register(email: string, fullName: string, password: string) {
    const existing = await this.usersService.getUserByEmail(email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }
    const user = await this.usersService.createUser(email, fullName, password);
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user || !user.passwordHash) {
      throw new BadRequestException('Invalid credentials');
    }
    const valid = await this.usersService.validatePassword(password, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('Invalid credentials');
    }
    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
    return { accessToken, user: { id: user.id, email: user.email } };
  }
}
