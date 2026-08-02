import { Inject, Injectable } from '@nestjs/common';
import { toAppointmentResponse } from '../../dtos/appointments/appointment-response.dto';
import { CheckInAppointmentRequestDto } from '../../dtos/appointments/check-in-appointment.dto';
import { CheckInResponseDto } from '../../dtos/appointments/checkin-response.dto';
import {
  AppointmentNotConfirmedError,
  CheckInDateMismatchError,
  DoctorNotScheduledError,
  ResourceNotFoundError,
  ScheduleRoomMissingError,
} from '../../errors/application-error';
import { isSameClinicDay, nowAsClinicNaiveUtc } from '../../../domain/services/clinic-calendar.util';
import { DoctorDisplayName } from '../../../domain/value-objects/doctor-display-name.vo';
import { AUDIT_LOG_PORT, AuditLogPort } from '../../ports/audit-log.port';
import { REALTIME_PORT, RealtimePort } from '../../ports/realtime.port';
import { AppointmentStatus } from '../../../domain/enums/appointment-status.enum';
import {
  APPOINTMENT_REPOSITORY,
  AppointmentRepository,
} from '../../../domain/repositories/appointment.repository';
import { PATIENT_REPOSITORY, PatientRepository } from '../../../domain/repositories/patient.repository';
import { SERVICE_REPOSITORY, ServiceRepository } from '../../../domain/repositories/service.repository';
import { USER_REPOSITORY, UserRepository } from '../../../domain/repositories/user.repository';
import {
  WORK_SCHEDULE_REPOSITORY,
  WorkScheduleRepository,
} from '../../../domain/repositories/work-schedule.repository';

export interface CheckInAppointmentInput extends CheckInAppointmentRequestDto {
  appointmentId: string;
  actorId: string;
}

@Injectable()
export class CheckInAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private readonly appointmentRepository: AppointmentRepository,
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: PatientRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(SERVICE_REPOSITORY) private readonly serviceRepository: ServiceRepository,
    @Inject(WORK_SCHEDULE_REPOSITORY) private readonly workScheduleRepository: WorkScheduleRepository,
    @Inject(AUDIT_LOG_PORT) private readonly auditLog: AuditLogPort,
    @Inject(REALTIME_PORT) private readonly realtimePort: RealtimePort,
  ) {}

  async execute(input: CheckInAppointmentInput): Promise<CheckInResponseDto> {
    const appointment = await this.appointmentRepository.findById(input.appointmentId);
    if (!appointment) throw new ResourceNotFoundError('Appointment', { id: input.appointmentId });

    // Business Rule: only CONFIRMED appointments can be checked in.
    if (appointment.status !== AppointmentStatus.CONFIRMED) throw new AppointmentNotConfirmedError();

    // Business Rule: check-in is only allowed on the appointment's own
    // calendar day — a receptionist should not be able to check a patient
    // into a visit for an appointment booked on a different day.
    if (!isSameClinicDay(appointment.appointmentTime, nowAsClinicNaiveUtc())) {
      throw new CheckInDateMismatchError();
    }

    // Business Rule: a doctor must be assigned before check-in — an
    // appointment booked doctor-less (see CreateAppointmentUseCase's
    // optional-doctor booking) must first go through UpdateAppointmentUseCase
    // to have a doctor set, since the room is resolved from that doctor's
    // work-schedule shift.
    if (!appointment.doctorId) throw new DoctorNotScheduledError();

    // Business Rule: room is resolved from the doctor's pre-assigned work
    // schedule, not hand-picked by the receptionist. Uses the actual
    // check-in moment (now), not appointment.appointmentTime — a patient
    // booked for the afternoon who is actually checked in during the
    // morning shift (early arrival, schedule change, etc.) must land in
    // whichever room the doctor is covering right now, otherwise the visit
    // gets stamped with the originally-booked shift's room and never shows
    // up in the queue of the shift the patient is actually physically in.
    const shift = await this.workScheduleRepository.findCoveringShift(
      appointment.doctorId,
      nowAsClinicNaiveUtc(),
    );
    if (!shift) throw new DoctorNotScheduledError();
    if (!shift.roomId) throw new ScheduleRoomMissingError();

    const checkedInAt = new Date();

    // One atomic write: appointment status/room/checkedInAt + history +
    // visit. No deposit involved — check-in is purely a status transition
    // now (removed 2026-07-19, see Feature 60/91 changelog).
    const result = await this.appointmentRepository.checkIn({
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      roomId: shift.roomId,
      priority: input.priority,
      checkedInAt,
      changedBy: input.actorId,
      oldStatus: appointment.status,
    });

    await this.auditLog.write({
      userId: input.actorId,
      action: 'APPOINTMENT_CHECKED_IN',
      module: 'APPOINTMENT',
      targetId: appointment.id,
    });

    const [patient, doctor, service] = await Promise.all([
      this.patientRepository.findById(result.appointment.patientId),
      result.appointment.doctorId ? this.userRepository.findById(result.appointment.doctorId) : Promise.resolve(null),
      result.appointment.serviceId ? this.serviceRepository.findById(result.appointment.serviceId) : Promise.resolve(null),
    ]);

    try {
      this.realtimePort.emit('RECEPTIONIST', 'appointment:changed', { appointmentId: result.appointment.id });
    } catch {
      // Realtime notification is best-effort — never let it fail the write.
    }

    return {
      appointment: toAppointmentResponse(
        result.appointment,
        patient?.fullName ?? '',
        patient?.patientCode ?? '',
        doctor ? DoctorDisplayName.format(doctor.fullName) : '',
        service?.name ?? '',
      ),
      visit: {
        id: result.visit.id,
        appointmentId: result.visit.appointmentId,
        patientId: result.visit.patientId,
        doctorId: result.visit.doctorId,
        roomId: result.visit.roomId,
        queueNumber: result.visit.queueNumber,
        priority: result.visit.priority,
        status: result.visit.status,
        createdAt: result.visit.createdAt,
      },
    };
  }
}
