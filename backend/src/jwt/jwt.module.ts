import { Global, Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { JwtTokenService } from './jwt.service';

@Global()
@Module({
  imports: [NestJwtModule],
  providers: [JwtTokenService],
  exports: [JwtTokenService],
})
export class JwtModule {}
