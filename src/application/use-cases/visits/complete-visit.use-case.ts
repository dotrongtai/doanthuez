import { Inject, Injectable } from '@nestjs/common';
import { VisitResponseDto, toVisitResponse } from '../../dtos/visits/visit-response.dto';
import {
  ExaminationResultRequiredError,
  VisitHasIncompleteClsError,
  VisitNotFoundError,
  VisitNotInProgressError,
} from '../../errors/application-error';
import { AUDIT_LOG_PORT, AuditLogPort } from '../../ports/audit-log.port';
import { REALTIME_PORT, RealtimePort } from '../../ports/realtime.port';
import { AppointmentStatus } from '../../../domain/enums/appointment-status.enum';
import { VisitStatus } from '../../../domain/enums/visit-status.enum';
import { VISIT_REPOSITORY, VisitRepository } from '../../../domain/repositories/visit.repository';
import { PATIENT_REPOSITORY, PatientRepository } from '../../../domain/repositories/patient.repository';
import { USER_REPOSITORY, UserRepository } from '../../../domain/repositories/user.repository';
import { SERVICE_REPOSITORY, ServiceRepository } from '../../../domain/repositories/service.repository';
import { APPOINTMENT_REPOSITORY, AppointmentRepository } from '../../../domain/repositories/appointment.repository';

@Injectable()
export class CompleteVisitUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY) private readonly visitRepository: VisitRepository,
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: PatientRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(SERVICE_REPOSITORY) private readonly serviceRepository: ServiceRepository,
    @Inject(APPOINTMENT_REPOSITORY) private readonly appointmentRepository: AppointmentRepository,
    @Inject(AUDIT_LOG_PORT) private readonly auditLog: AuditLogPort,
    @Inject(REALTIME_PORT) private readonly realtimePort: RealtimePort,
  ) {}

  async execute(visitId: string, actorId: string): Promise<VisitResponseDto> {
    const visit = await this.visitRepository.findById(visitId);
    if (!visit) throw new VisitNotFoundError();
    if (visit.status !== VisitStatus.IN_PROGRESS) throw new VisitNotInProgressError();

    // Business Rule: examination result must exist before completing
    const result = await this.visitRepository.findResultWithDetails(visitId);
    if (!result) throw new ExaminationResultRequiredError();

    // Business Rule: all CLS orders must be COMPLETED or CANCELLED
    const hasIncomplete = await this.visitRepository.hasIncompleteClsOrders(visitId);
    if (hasIncomplete) throw new VisitHasIncompleteClsError();

    const completedAt = new Date();
    const updated = await this.visitRepository.completeVisit(visitId, completedAt);
    await this.appointmentRepository.updateStatus(visit.appointmentId, AppointmentStatus.COMPLETED);

    await this.auditLog.write({
      userId: actorId,
      action: 'COMPLETE_VISIT',
      module: 'VISIT',
      targetId: visitId,
    });

    const appointment = await this.appointmentRepository.findById(visit.appointmentId);
    const [patient, doctor, service] = await Promise.all([
      this.patientRepository.findById(visit.patientId),
      this.userRepository.findById(visit.doctorId),
      appointment?.serviceId ? this.serviceRepository.findById(appointment.serviceId) : Promise.resolve(null),
    ]);

    try {
      this.realtimePort.emit(['DOCTOR', 'NURSE', 'RECEPTIONIST'], 'visit:changed', { visitId: updated.id });
      // Also emit appointment:changed: Appointment.status just flipped to
      // COMPLETED (unlocking invoice creation), and only this event is what
      // the receptionist's appointment list/detail page listens for.
      this.realtimePort.emit('RECEPTIONIST', 'appointment:changed', { appointmentId: visit.appointmentId });
    } catch {
      // Realtime notification is best-effort — never let it fail the write.
    }

    return toVisitResponse(
      updated,
      patient?.fullName ?? '',
      patient?.patientCode ?? '',
      doctor?.fullName ?? '',
      service?.name ?? '',
      appointment?.appointmentTime ?? new Date(),
      appointment?.note ?? null,
    );
  }
}
