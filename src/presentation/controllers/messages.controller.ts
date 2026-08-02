import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetMessageUseCase } from '../../application/use-cases/messages/get-message.use-case';
import { DEFAULT_LOCALE } from '../../application/ports/message-catalog.port';
import { Public } from '../decorators/public.decorator';
import { SkipAudit } from '../decorators/skip-audit.decorator';

@Public()
@SkipAudit()
@Controller('messages')
export class MessagesController {
  constructor(private readonly getMessageUseCase: GetMessageUseCase) {}

  @Get(':code')
  findOne(@Param('code') code: string, @Query('locale') locale?: string) {
    return this.getMessageUseCase.execute(code, locale ?? DEFAULT_LOCALE);
  }
}
