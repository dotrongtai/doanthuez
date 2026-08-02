import { Injectable } from '@nestjs/common';
import { ShiftType } from '../../../domain/enums/shift-type.enum';
import { ResolveActorShiftService } from '../../services/resolve-actor-shift.service';

export interface VisitQueueContextDto {
  shift: ShiftType | null;
  roomId: string | null;
  roomName: string | null;
}

// Tells the doctor/nurse queue screen which room the caller is currently
// staffing, so the page can render "Phòng X · Ca sáng" in its header and
// show a "not on shift" empty state instead of a bare "no visits" table
// when the actor has no covering WorkSchedule row.
@Injectable()
export class GetVisitQueueContextUseCase {
  constructor(private readonly resolveActorShift: ResolveActorShiftService) {}

  async execute(actorId: string, date?: string, shift?: ShiftType): Promise<VisitQueueContextDto> {
    const { context } = await this.resolveActorShift.resolve(actorId, date, shift);
    return context;
  }
}
