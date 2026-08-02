import { ShiftType } from '../enums/shift-type.enum';

export class WorkSchedule {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly roomId: string | null,
    public readonly workDate: Date,
    public readonly shift: ShiftType,
    public readonly note: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: string,
    public readonly updatedBy: string | null,
  ) {}
}
