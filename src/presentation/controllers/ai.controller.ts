import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiChatRequestDto } from '../../application/dtos/ai/ai-chat.dto';
import { PaginationDto } from '../../application/dtos/pagination.dto';
import { ChatWithAiUseCase } from '../../application/use-cases/ai/chat-with-ai.use-case';
import { GetAiChatHistoryUseCase } from '../../application/use-cases/ai/get-ai-chat-history.use-case';
import { SummarizeExamResultUseCase } from '../../application/use-cases/ai/summarize-exam-result.use-case';
import { RunRecheckReminderUseCase } from '../../application/use-cases/ai/run-recheck-reminder.use-case';
import { ListRecheckNotificationsUseCase } from '../../application/use-cases/ai/list-recheck-notifications.use-case';
import { UserRole } from '../../domain/enums/user-role.enum';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { Roles } from '../decorators/roles.decorator';
import { AuthenticatedUser } from '../guards/authenticated-user.type';

// Feature 83 business rule: "Rate limit: tối đa 20 request/phút/user" — no
// authenticated-user tracking infra exists for @Public() routes in this
// codebase yet (see chat-with-ai.use-case.ts note), so this throttles by
// caller IP instead, which is the nestjs/throttler default tracker.
const AI_CHAT_RATE_LIMIT = { limit: 20, ttl: 60_000 };

@Controller('ai')
export class AiController {
  constructor(
    private readonly chatWithAiUseCase: ChatWithAiUseCase,
    private readonly getAiChatHistoryUseCase: GetAiChatHistoryUseCase,
    private readonly summarizeExamResultUseCase: SummarizeExamResultUseCase,
    private readonly runRecheckReminderUseCase: RunRecheckReminderUseCase,
    private readonly listRecheckNotificationsUseCase: ListRecheckNotificationsUseCase,
  ) {}

  // Public because the widget also renders on the unauthenticated (public)
  // clinic landing page (see PatientSiteShell) — a logged-in patient's
  // messages are still logged, just without a resolved userId, since
  // @Public() routes never populate req.user in this codebase's JwtAuthGuard.
  @Public()
  @Post('chat')
  @Throttle({ default: AI_CHAT_RATE_LIMIT })
  chat(@Body() dto: AiChatRequestDto) {
    return this.chatWithAiUseCase.execute({ ...dto, userId: null });
  }

  // Public: sessionId is an unguessable client-generated UUID (same access
  // model as POST chat) — lets the widget restore a conversation after a
  // page reload/popup close without any auth requirement.
  @Public()
  @Get('chat/:sessionId/history')
  @Throttle({ default: AI_CHAT_RATE_LIMIT })
  getHistory(@Param('sessionId') sessionId: string) {
    return this.getAiChatHistoryUseCase.execute(sessionId);
  }

  // Feature 85 business rule: "Chỉ áp dụng với kết quả khám của chính bệnh
  // nhân đó" — requires login (unlike the public chat endpoints above), and
  // the use case only ever searches the caller's own medical record.
  @Roles(UserRole.PATIENT)
  @Get('summarize-result/:visitId')
  @Throttle({ default: AI_CHAT_RATE_LIMIT })
  summarizeResult(@Param('visitId') visitId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.summarizeExamResultUseCase.execute({ userId: user.sub, visitId });
  }

  // Feature 89: manual/demo trigger for the daily 02:00 batch job (see
  // RecheckReminderScheduler) — same use case, run on demand.
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @Post('recheck-analysis')
  runRecheckAnalysis() {
    return this.runRecheckReminderUseCase.execute();
  }

  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @Get('recheck-notifications')
  listRecheckNotifications(@Query() query: PaginationDto) {
    return this.listRecheckNotificationsUseCase.execute(query);
  }
}
