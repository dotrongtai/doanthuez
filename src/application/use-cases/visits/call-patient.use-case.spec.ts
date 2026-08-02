import { CallPatientUseCase } from './call-patient.use-case';
import { Visit } from '../../../domain/entities/visit.entity';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { Patient } from '../../../domain/entities/patient.entity';
import { User } from '../../../domain/entities/user.entity';
import { Service } from '../../../domain/entities/service.entity';
import { VisitStatus } from '../../../domain/enums/visit-status.enum';
import { VisitPriority } from '../../../domain/enums/visit-priority.enum';
import { AppointmentStatus } from '../../../domain/enums/appointment-status.enum';
import { ServiceType } from '../../../domain/enums/service-type.enum';
import { Gender } from '../../../domain/enums/gender.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { VisitNotCallableError, VisitNotFoundError } from '../../errors/application-error';

function buildVisit(overrides: Partial<Visit> = {}): Visit {
  return new Visit(
    overrides.id ?? 'visit-001',
    overrides.appointmentId ?? 'apt-001',
    overrides.patientId ?? 'pat-001',
    overrides.doctorId ?? 'doc-001',
    overrides.roomId ?? 'room-01',
    overrides.queueNumber ?? 'A01',
    overrides.priority ?? VisitPriority.NORMAL,
    overrides.status ?? VisitStatus.WAITING,
    overrides.calledAt ?? null,
    overrides.calledCount ?? 0,
    overrides.startedAt ?? null,
    overrides.completedAt ?? null,
    overrides.createdAt ?? new Date('2026-08-01T00:00:00Z'),
  );
}

function buildAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return new Appointment(
    overrides.id ?? 'apt-001',
    overrides.patientId ?? 'pat-001',
    overrides.doctorId ?? 'doc-001',
    overrides.serviceId ?? 'svc-001',
    overrides.roomId ?? 'room-01',
    overrides.scheduleId ?? null,
    overrides.appointmentTime ?? new Date('2026-08-05T08:00:00Z'),
    overrides.status ?? AppointmentStatus.CHECKED_IN,
    overrides.note ?? 'Đau đầu',
    overrides.cancelReason ?? null,
    overrides.cancelledBy ?? null,
    overrides.cancelledAt ?? null,
    overrides.checkedInAt ?? null,
    overrides.bookedBy ?? 'pat-001',
    overrides.createdAt ?? new Date(),
    overrides.updatedAt ?? new Date(),
  );
}

function buildPatient(overrides: Partial<Patient> = {}): Patient {
  return new Patient(
    overrides.id ?? 'pat-001',
    overrides.patientCode ?? 'BN0001',
    overrides.fullName ?? 'Nguyễn Văn A',
    overrides.email ?? 'a@example.com',
    overrides.dateOfBirth ?? new Date('1990-01-01'),
    overrides.gender ?? Gender.MALE,
    overrides.phone ?? '0900000000',
    overrides.idCard ?? '079000000001',
    overrides.address ?? null,
    overrides.note ?? null,
    overrides.notificationConsent ?? true,
    overrides.userId ?? 'user-pat-001',
    overrides.createdAt ?? new Date(),
    overrides.updatedAt ?? new Date(),
  );
}

function buildDoctor(overrides: Partial<User> = {}): User {
  return new User(
    overrides.id ?? 'doc-001',
    overrides.fullName ?? 'BS. Trần B',
    overrides.email ?? 'doctor@example.com',
    overrides.phone ?? '0911111111',
    overrides.passwordHash ?? 'hash',
    overrides.role ?? UserRole.DOCTOR,
    overrides.isActive ?? true,
    overrides.mustChangePassword ?? false,
    overrides.failedLoginCount ?? 0,
    overrides.lockedAt ?? null,
    overrides.lastLoginAt ?? null,
    overrides.createdAt ?? new Date(),
    overrides.updatedAt ?? new Date(),
  );
}

function buildService(overrides: Partial<Service> = {}): Service {
  return new Service(
    overrides.id ?? 'svc-001',
    overrides.serviceCode ?? 'SV001',
    overrides.name ?? 'Khám tổng quát',
    overrides.specialtyId ?? null,
    overrides.type ?? ServiceType.EXAMINATION,
    overrides.clsCategory ?? null,
    overrides.price ?? 200000,
    overrides.description ?? null,
    overrides.isActive ?? true,
    overrides.createdAt ?? new Date(),
    overrides.updatedAt ?? new Date(),
    overrides.deletedAt ?? null,
  );
}

describe('CallPatientUseCase', () => {
  function buildUseCase(options: {
    visit: Visit | null;
    appointment?: Appointment | null;
    patient?: Patient | null;
    doctor?: User | null;
    service?: Service | null;
    callPatientImpl?: jest.Mock;
    realtimeEmitImpl?: jest.Mock;
  }) {
    const { visit, appointment = buildAppointment(), patient = buildPatient(), doctor = buildDoctor(), service = buildService() } = options;

    const updatedVisit = visit
      ? buildVisit({ ...visit, status: VisitStatus.CALLED, calledCount: visit.calledCount + 1, calledAt: new Date() })
      : null;

    const visitRepository = {
      findById: jest.fn().mockResolvedValue(visit),
      callPatient:
        options.callPatientImpl ?? jest.fn().mockResolvedValue(updatedVisit),
    };
    const patientRepository = { findById: jest.fn().mockResolvedValue(patient) };
    const userRepository = { findById: jest.fn().mockResolvedValue(doctor) };
    const serviceRepository = { findById: jest.fn().mockResolvedValue(service) };
    const appointmentRepository = { findById: jest.fn().mockResolvedValue(appointment) };
    const auditLog = { write: jest.fn().mockResolvedValue(undefined) };
    const realtimePort = { emit: options.realtimeEmitImpl ?? jest.fn() };

    const useCase = new CallPatientUseCase(
      visitRepository as never,
      patientRepository as never,
      userRepository as never,
      serviceRepository as never,
      appointmentRepository as never,
      auditLog as never,
      realtimePort as never,
    );

    return { useCase, visitRepository, patientRepository, userRepository, serviceRepository, appointmentRepository, auditLog, realtimePort };
  }

  // UT01 - N: happy path, WAITING -> CALLED, full related data present
  it('calls the patient when the visit is WAITING and returns the full response', async () => {
    const visit = buildVisit({ status: VisitStatus.WAITING, calledCount: 0 });
    const { useCase, visitRepository, auditLog } = buildUseCase({ visit });

    const result = await useCase.execute('visit-001', 'user-nurse-01');

    expect(result.status).toBe(VisitStatus.CALLED);
    expect(result.calledCount).toBe(1);
    expect(result.patientName).toBe('Nguyễn Văn A');
    expect(result.patientCode).toBe('BN0001');
    expect(result.doctorName).toBe('BS. Trần B');
    expect(result.serviceName).toBe('Khám tổng quát');
    expect(result.note).toBe('Đau đầu');
    expect(visitRepository.callPatient).toHaveBeenCalledWith('visit-001', expect.any(Date), 1);
    expect(auditLog.write).toHaveBeenCalledWith({
      userId: 'user-nurse-01',
      action: 'CALL_PATIENT',
      module: 'VISIT',
      targetId: 'visit-001',
    });
  });

  // UT02 - N: re-page after NO_SHOW
  it('calls the patient again when the visit is NO_SHOW', async () => {
    const visit = buildVisit({ status: VisitStatus.NO_SHOW, calledCount: 2 });
    const { useCase, visitRepository } = buildUseCase({ visit });

    const result = await useCase.execute('visit-001', 'user-nurse-01');

    expect(result.status).toBe(VisitStatus.CALLED);
    expect(visitRepository.callPatient).toHaveBeenCalledWith('visit-001', expect.any(Date), 3);
  });

  // UT03 - A: visit not found
  it('throws VisitNotFoundError when the visit does not exist', async () => {
    const { useCase } = buildUseCase({ visit: null });

    await expect(useCase.execute('visit-not-exist', 'user-nurse-01')).rejects.toBeInstanceOf(VisitNotFoundError);
  });

  // UT04 - A: IN_PROGRESS is not callable
  it('throws VisitNotCallableError when the visit is IN_PROGRESS', async () => {
    const visit = buildVisit({ status: VisitStatus.IN_PROGRESS });
    const { useCase } = buildUseCase({ visit });

    await expect(useCase.execute('visit-001', 'user-nurse-01')).rejects.toBeInstanceOf(VisitNotCallableError);
  });

  // UT05 - A: COMPLETED is not callable
  it('throws VisitNotCallableError when the visit is COMPLETED', async () => {
    const visit = buildVisit({ status: VisitStatus.COMPLETED });
    const { useCase } = buildUseCase({ visit });

    await expect(useCase.execute('visit-001', 'user-nurse-01')).rejects.toBeInstanceOf(VisitNotCallableError);
  });

  // UT06 - A: AWAITING_RESULTS is not callable
  it('throws VisitNotCallableError when the visit is AWAITING_RESULTS', async () => {
    const visit = buildVisit({ status: VisitStatus.AWAITING_RESULTS });
    const { useCase } = buildUseCase({ visit });

    await expect(useCase.execute('visit-001', 'user-nurse-01')).rejects.toBeInstanceOf(VisitNotCallableError);
  });

  // UT07 - A: repository update failure propagates
  it('propagates the error when visitRepository.callPatient fails', async () => {
    const visit = buildVisit({ status: VisitStatus.WAITING });
    const callPatientImpl = jest.fn().mockRejectedValue(new Error('DB connection lost'));
    const { useCase } = buildUseCase({ visit, callPatientImpl });

    await expect(useCase.execute('visit-001', 'user-nurse-01')).rejects.toThrow('DB connection lost');
  });

  // UT08 - B: boundary self-transition, CALLED -> CALLED
  it('allows re-calling a visit that is already CALLED', async () => {
    const visit = buildVisit({ status: VisitStatus.CALLED, calledCount: 1 });
    const { useCase, visitRepository } = buildUseCase({ visit });

    const result = await useCase.execute('visit-001', 'user-nurse-01');

    expect(result.status).toBe(VisitStatus.CALLED);
    expect(visitRepository.callPatient).toHaveBeenCalledWith('visit-001', expect.any(Date), 2);
  });

  // UT09 - B: boundary enum value outside the allowed whitelist
  it('throws VisitNotCallableError when the visit is CANCELLED', async () => {
    const visit = buildVisit({ status: VisitStatus.CANCELLED });
    const { useCase } = buildUseCase({ visit });

    await expect(useCase.execute('visit-001', 'user-nurse-01')).rejects.toBeInstanceOf(VisitNotCallableError);
  });

  // UT10 - B: missing linked data falls back to empty strings / defaults
  it('falls back to empty strings and defaults when related data is missing', async () => {
    const visit = buildVisit({ status: VisitStatus.WAITING, patientId: 'pat-missing', doctorId: 'doc-missing' });
    const appointment = buildAppointment({ serviceId: null, note: null });
    const { useCase, serviceRepository } = buildUseCase({
      visit,
      appointment,
      patient: null,
      doctor: null,
      service: null,
    });

    const result = await useCase.execute('visit-001', 'user-nurse-01');

    expect(result.patientName).toBe('');
    expect(result.patientCode).toBe('');
    expect(result.doctorName).toBe('');
    expect(result.serviceName).toBe('');
    expect(result.note).toBeNull();
    expect(result.appointmentTime).toEqual(appointment.appointmentTime);
    expect(serviceRepository.findById).not.toHaveBeenCalled();
  });

  // UT11 - A: realtime notification is best-effort and must not fail the use case
  it('still returns a successful response when the realtime emit throws', async () => {
    const visit = buildVisit({ status: VisitStatus.WAITING });
    const realtimeEmitImpl = jest.fn().mockImplementation(() => {
      throw new Error('socket down');
    });
    const { useCase } = buildUseCase({ visit, realtimeEmitImpl });

    const result = await useCase.execute('visit-001', 'user-nurse-01');

    expect(result.status).toBe(VisitStatus.CALLED);
  });
});