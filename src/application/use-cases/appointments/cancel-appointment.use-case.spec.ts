import { CancelAppointmentUseCase } from './cancel-appointment.use-case';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { Patient } from '../../../domain/entities/patient.entity';
import { AppointmentStatus } from '../../../domain/enums/appointment-status.enum';
import { Gender } from '../../../domain/enums/gender.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { AppointmentCancelNotAllowedError, ForbiddenActionError } from '../../errors/application-error';

function buildAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return new Appointment(
    overrides.id ?? 'appt-1',
    overrides.patientId ?? 'patient-1',
    overrides.doctorId ?? 'doctor-1',
    overrides.serviceId ?? 'service-1',
    overrides.roomId ?? null,
    overrides.scheduleId ?? null,
    overrides.appointmentTime ?? new Date('2026-08-01T08:00:00Z'),
    overrides.status ?? AppointmentStatus.PENDING,
    overrides.note ?? null,
    overrides.cancelReason ?? null,
    overrides.cancelledBy ?? null,
    overrides.cancelledAt ?? null,
    overrides.checkedInAt ?? null,
    overrides.bookedBy ?? 'patient-1',
    overrides.createdAt ?? new Date(),
    overrides.updatedAt ?? new Date(),
  );
}

function buildPatient(overrides: Partial<Patient> = {}): Patient {
  return new Patient(
    overrides.id ?? 'patient-1',
    overrides.patientCode ?? 'BN-0001',
    overrides.fullName ?? 'Nguyen Van A',
    overrides.email ?? 'a@example.com',
    overrides.dateOfBirth ?? new Date('1990-01-01'),
    overrides.gender ?? Gender.MALE,
    overrides.phone ?? '0900000000',
    overrides.idCard ?? '079000000001',
    overrides.address ?? null,
    overrides.note ?? null,
    overrides.notificationConsent ?? true,
    overrides.userId ?? 'user-1',
    overrides.createdAt ?? new Date(),
    overrides.updatedAt ?? new Date(),
  );
}

describe('CancelAppointmentUseCase', () => {
  function buildUseCase(appointment: Appointment, patient: Patient | null) {
    const appointmentRepository = {
      findById: jest.fn().mockResolvedValue(appointment),
      updateStatus: jest.fn().mockResolvedValue({ ...appointment, status: AppointmentStatus.CANCELLED }),
      addHistory: jest.fn().mockResolvedValue(undefined),
    };
    const patientRepository = {
      findByUserId: jest.fn().mockResolvedValue(patient),
      findById: jest.fn().mockResolvedValue(patient),
    };
    const userRepository = { findById: jest.fn().mockResolvedValue(null) };
    const serviceRepository = { findById: jest.fn().mockResolvedValue(null) };
    const auditLog = { write: jest.fn().mockResolvedValue(undefined) };
    const notification = { notify: jest.fn().mockResolvedValue(undefined) };
    const realtimePort = { emit: jest.fn() };

    const useCase = new CancelAppointmentUseCase(
      appointmentRepository as never,
      patientRepository as never,
      userRepository as never,
      serviceRepository as never,
      auditLog as never,
      notification as never,
      realtimePort as never,
    );

    return { useCase, appointmentRepository, patientRepository, realtimePort };
  }

  it('cancels the appointment when the actor is the patient who owns it', async () => {
    const appointment = buildAppointment({ patientId: 'patient-1', status: AppointmentStatus.PENDING });
    const patient = buildPatient({ id: 'patient-1', userId: 'user-1' });
    const { useCase, appointmentRepository, realtimePort } = buildUseCase(appointment, patient);

    const result = await useCase.execute({
      appointmentId: 'appt-1',
      reason: 'changed my mind',
      actorId: 'user-1',
      actorRole: UserRole.PATIENT,
    });

    expect(result.status).toBe(AppointmentStatus.CANCELLED);
    expect(appointmentRepository.updateStatus).toHaveBeenCalledWith(
      'appt-1',
      AppointmentStatus.CANCELLED,
      expect.objectContaining({ cancelReason: 'changed my mind', cancelledBy: 'user-1' }),
    );
    expect(realtimePort.emit).toHaveBeenCalledWith('RECEPTIONIST', 'appointment:changed', {
      appointmentId: expect.any(String),
    });
  });

  // Alternative flow: the appointment belongs to someone else's patient
  // record — this is the ownership check the whole cancel() handler now
  // relies on unconditionally, since only PATIENT can reach this use case.
  it('throws ForbiddenActionError when the appointment does not belong to the acting patient', async () => {
    const appointment = buildAppointment({ patientId: 'someone-elses-patient-id' });
    const patient = buildPatient({ id: 'patient-1', userId: 'user-1' });
    const { useCase } = buildUseCase(appointment, patient);

    await expect(
      useCase.execute({
        appointmentId: 'appt-1',
        reason: 'not mine',
        actorId: 'user-1',
        actorRole: UserRole.PATIENT,
      }),
    ).rejects.toBeInstanceOf(ForbiddenActionError);
  });

  it('throws AppointmentCancelNotAllowedError when the appointment is already checked in', async () => {
    const appointment = buildAppointment({ patientId: 'patient-1', status: AppointmentStatus.CHECKED_IN });
    const patient = buildPatient({ id: 'patient-1', userId: 'user-1' });
    const { useCase } = buildUseCase(appointment, patient);

    await expect(
      useCase.execute({
        appointmentId: 'appt-1',
        reason: 'too late',
        actorId: 'user-1',
        actorRole: UserRole.PATIENT,
      }),
    ).rejects.toBeInstanceOf(AppointmentCancelNotAllowedError);
  });
});
