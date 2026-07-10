import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { SendEmailDto } from './dto/send-email.dto';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendEmail(@Body() dto: SendEmailDto): Promise<void> {
    await this.mailService.sendUserNotification(dto.to, {
      subject: dto.subject,
      text: dto.text,
      html: dto.html,
    });
  }
}
