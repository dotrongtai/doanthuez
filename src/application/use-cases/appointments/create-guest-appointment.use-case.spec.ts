import { CreateGuestAppointmentUseCase } from './create-guest-appointment.use-case';
import { AppointmentStatus } from '../../../domain/enums/appointment-status.enum';
import { Gender } from '../../../domain/enums/gender.enum';
import { nowAsClinicNaiveUtc } from '../../../domain/services/clinic-calendar.util';
import { ConflictError } from '../../errors/application-error';

function futureSlot(): Date {
  const now = nowAsClinicNaiveUtc();
  return new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 15, 9, 0, 0, 0));
}

describe('CreateGuestAppointmentUseCase', () => {
  function buildDeps() {
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      findByPhone: jest.fn().mockResolvedValue(null),
      findByIdCard: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: 'user-1',
        fullName: 'Nguyen Van A',
        email: 'guest@example.com',
        phone: '0900000000',
        role: 'PATIENT',
        mustChangePassword: false,
      }),
      findById: jest.fn().mockResolvedValue(null),
    };
    const patientRepository = {
      findByPhone: jest.fn().mockResolvedValue(null),
      findByIdCard: jest.fn().mockResolvedValue(null),
      linkUser: jest.fn(),
      create: jest.fn().mockResolvedValue({
        id: 'patient-1',
        fullName: 'Nguyen Van A',
        patientCode: 'BN-0001',
      }),
      findById: jest.fn().mockResolvedValue({
        id: 'patient-1',
        fullName: 'Nguyen Van A',
        patientCode: 'BN-0001',
      }),
    };
    const serviceRepository = { findById: jest.fn() };
    const workScheduleRepository = { findCoveringShift: jest.fn() };
    const appointmentRepository = {
      findConflict: jest.fn().mockResolvedValue(null),
      findDoctorConflict: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'appt-1', ...data })),
      addHistory: jest.fn().mockResolvedValue(undefined),
    };
    const refreshTokenRepository = { create: jest.fn().mockResolvedValue(undefined) };
    const auditLog = { write: jest.fn().mockResolvedValue(undefined) };
    const realtimePort = { emit: jest.fn() };
    const jwtService = { sign: jest.fn().mockReturnValue('signed-access-token') };
    const configService = { get: jest.fn().mockReturnValue(7) };

    const useCase = new CreateGuestAppointmentUseCase(
      userRepository as never,
      patientRepository as never,
      serviceRepository as never,
      workScheduleRepository as never,
      appointmentRepository as never,
      refreshTokenRepository as never,
      auditLog as never,
      realtimePort as never,
      jwtService as never,
      configService as never,
    );

    return { useCase, userRepository, patientRepository, appointmentRepository, realtimePort };
  }

  it('creates a User+Patient account and a PENDING doctor-less appointment, then auto-logs-in', async () => {
    const { useCase, userRepository, patientRepository, appointmentRepository, realtimePort } = buildDeps();

    const result = await useCase.execute({
      fullName: 'Nguyen Van A',
      email: 'guest@example.com',
      phone: '0900000000',
      dateOfBirth: '1990-01-01',
      gender: Gender.MALE,
      idCard: '079000000001',
      appointmentTime: futureSlot(),
    });

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'guest@example.com', role: 'PATIENT', mustChangePassword: true }),
    );
    expect(patientRepository.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1' }));
    expect(appointmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ patientId: 'patient-1', status: AppointmentStatus.PENDING, bookedBy: 'user-1' }),
    );
    expect(result.accessToken).toBe('signed-access-token');
    expect(result.appointment.status).toBe(AppointmentStatus.PENDING);
    expect(realtimePort.emit).toHaveBeenCalled();
  });

  it('rejects when the email is already registered', async () => {
    const { useCase, userRepository } = buildDeps();
    userRepository.findByEmail.mockResolvedValueOnce({ id: 'existing-user' });

    await expect(
      useCase.execute({
        fullName: 'Nguyen Van A',
        email: 'guest@example.com',
        phone: '0900000000',
        dateOfBirth: '1990-01-01',
        gender: Gender.MALE,
        idCard: '079000000001',
        appointmentTime: futureSlot(),
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
