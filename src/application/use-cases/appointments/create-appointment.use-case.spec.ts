import { CreateAppointmentUseCase } from './create-appointment.use-case';
import { Patient } from '../../../domain/entities/patient.entity';
import { AppointmentStatus } from '../../../domain/enums/appointment-status.enum';
import { ServiceType } from '../../../domain/enums/service-type.enum';
import { Gender } from '../../../domain/enums/gender.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { nowAsClinicNaiveUtc } from '../../../domain/services/clinic-calendar.util';
import { DoctorNotScheduledError } from '../../errors/application-error';

function buildPatient(): Patient {
  return new Patient(
    'patient-1',
    'BN-0001',
    'Nguyen Van A',
    'a@example.com',
    new Date('1990-01-01'),
    Gender.MALE,
    '0900000000',
    '079000000001',
    null,
    null,
    true,
    'user-1',
    new Date(),
    new Date(),
  );
}

// A future, 30-minute-slot-aligned datetime — matches the clinic-naive-UTC
// convention documented in clinic-calendar.util.ts.
function futureSlot(): Date {
  const now = nowAsClinicNaiveUtc();
  const d = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 15, 9, 0, 0, 0));
  return d;
}

describe('CreateAppointmentUseCase', () => {
  function buildDeps() {
    const appointmentRepository = {
      findConflict: jest.fn().mockResolvedValue(null),
      findDoctorConflict: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((data) =>
        Promise.resolve({
          id: 'appt-1',
          ...data,
        }),
      ),
      addHistory: jest.fn().mockResolvedValue(undefined),
    };
    const patientRepository = {
      findByUserId: jest.fn().mockResolvedValue(buildPatient()),
      findById: jest.fn().mockResolvedValue(buildPatient()),
    };
    const userRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'doctor-1', fullName: 'Dr. B' }),
    };
    const serviceRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'service-1', name: 'Kham tong quat', type: ServiceType.EXAMINATION }),
    };
    const workScheduleRepository = {
      findCoveringShift: jest.fn().mockResolvedValue({ id: 'shift-1', roomId: 'room-1' }),
    };
    const auditLog = { write: jest.fn().mockResolvedValue(undefined) };
    const realtimePort = { emit: jest.fn() };

    const useCase = new CreateAppointmentUseCase(
      appointmentRepository as never,
      patientRepository as never,
      userRepository as never,
      serviceRepository as never,
      workScheduleRepository as never,
      auditLog as never,
      realtimePort as never,
    );

    return {
      useCase,
      appointmentRepository,
      patientRepository,
      userRepository,
      serviceRepository,
      workScheduleRepository,
      realtimePort,
    };
  }

  it('books a CONFIRMED appointment with doctor/service when a receptionist supplies both', async () => {
    const { useCase, appointmentRepository, workScheduleRepository } = buildDeps();

    const result = await useCase.execute({
      patientId: 'patient-1',
      doctorId: 'doctor-1',
      serviceId: 'service-1',
      appointmentTime: futureSlot(),
      bookedBy: 'receptionist-1',
      bookedByRole: UserRole.RECEPTIONIST,
    });

    expect(result.status).toBe(AppointmentStatus.CONFIRMED);
    expect(workScheduleRepository.findCoveringShift).toHaveBeenCalledWith('doctor-1', expect.any(Date));
    expect(appointmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ doctorId: 'doctor-1', serviceId: 'service-1', scheduleId: 'shift-1' }),
    );
  });

  // Alternative flow (item 2): doctor/service are now optional. When a
  // patient books without either, no shift/doctor-conflict lookups should
  // happen at all, and the appointment is created doctor-less/service-less.
  it('books a doctor-less, service-less PENDING appointment for a patient booker when both are omitted', async () => {
    const { useCase, appointmentRepository, workScheduleRepository, userRepository, serviceRepository } =
      buildDeps();

    const result = await useCase.execute({
      appointmentTime: futureSlot(),
      bookedBy: 'user-1',
      bookedByRole: UserRole.PATIENT,
    });

    expect(result.status).toBe(AppointmentStatus.PENDING);
    expect(workScheduleRepository.findCoveringShift).not.toHaveBeenCalled();
    expect(userRepository.findById).not.toHaveBeenCalled();
    expect(serviceRepository.findById).not.toHaveBeenCalled();
    expect(appointmentRepository.findDoctorConflict).not.toHaveBeenCalled();
    expect(appointmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ doctorId: null, serviceId: null, scheduleId: null }),
    );
  });

  it('throws DoctorNotScheduledError when a doctor is supplied but has no covering shift', async () => {
    const { useCase, workScheduleRepository } = buildDeps();
    workScheduleRepository.findCoveringShift.mockResolvedValueOnce(null);

    await expect(
      useCase.execute({
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        appointmentTime: futureSlot(),
        bookedBy: 'receptionist-1',
        bookedByRole: UserRole.RECEPTIONIST,
      }),
    ).rejects.toBeInstanceOf(DoctorNotScheduledError);
  });
});
