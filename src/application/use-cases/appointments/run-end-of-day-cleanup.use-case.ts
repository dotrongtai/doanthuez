import { Inject, Injectable } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY, AppointmentRepository } from '../../../domain/repositories/appointment.repository';
import { VISIT_REPOSITORY, VisitRepository } from '../../../domain/repositories/visit.repository';
import { USER_REPOSITORY, UserRepository } from '../../../domain/repositories/user.repository';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { nowAsClinicNaiveUtc, toClinicDateOnly } from '../../../domain/services/clinic-calendar.util';

export interface RunEndOfDayCleanupResult {
  cancelledAppointments: number;
  cancelledVisits: number;
}

@Injectable()
export class RunEndOfDayCleanupUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private readonly appointmentRepository: AppointmentRepository,
    @Inject(VISIT_REPOSITORY) private readonly visitRepository: VisitRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  // Run daily at 00:05 by EndOfDayCleanupScheduler. Anything still open from
  // a day that has already ended was never going to be resolved by staff —
  // the clinic is closed, so it can't be checked in/completed after the
  // fact. PENDING/CONFIRMED appointments (never checked in) become
  // CANCELLED; WAITING/CALLED/IN_PROGRESS/AWAITING_RESULTS visits (checked
  // in but never completed) also become CANCELLED — a status distinct from
  // NO_SHOW, which specifically means the patient never arrived at all.
  async execute(): Promise<RunEndOfDayCleanupResult> {
    const cutoff = toClinicDateOnly(nowAsClinicNaiveUtc());

    // Attributed to the first ADMIN account since this is a system action,
    // not a real user's — cancelled_by/changed_by are NOT NULL FKs to users.
    const [systemActor] = await this.userRepository.findAll({ role: UserRole.ADMIN }, 0, 1);
    if (!systemActor) {
      return { cancelledAppointments: 0, cancelledVisits: 0 };
    }

    const cancelledAppointments = await this.appointmentRepository.cancelStaleBefore(cutoff, systemActor.id);
    const cancelledVisits = await this.visitRepository.cancelStaleBefore(cutoff);

    return { cancelledAppointments, cancelledVisits };
  }
}
