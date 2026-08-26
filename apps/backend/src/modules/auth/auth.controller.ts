import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.fullName, dto.password);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout() {
    return { message: 'Logout successful. Please clear your local token.' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async whoami(@Request() req: any) {
    return { user: req.user };
  }
}