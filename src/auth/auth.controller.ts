import { Body, Controller, Post } from '@nestjs/common';
import * as loginRequestDto from 'src/auth/dto/login-request.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(
    @Body() body: loginRequestDto.LoginPayload
  ) {
    return null;
  }
}
