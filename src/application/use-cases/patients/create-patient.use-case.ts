import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AUDIT_LOG_PORT, AuditLogPort } from '../../ports/audit-log.port';
import { CreatePatientRequestDto } from '../../dtos/patients/create-patient.dto';
import { PatientResponseDto, toPatientResponse } from '../../dtos/patients/patient-response.dto';
import { ConflictError } from '../../errors/application-error';
import { PatientCode } from '../../../domain/value-objects/patient-code.vo';
import { DEFAULT_PATIENT_PASSWORD } from '../../../domain/value-objects/password-policy.vo';
import { UserRole } from '../../../domain/enums/user-role.enum';
import {
  MEDICAL_RECORD_REPOSITORY,
  MedicalRecordRepository,
} from '../../../domain/repositories/medical-record.repository';
import { PATIENT_REPOSITORY, PatientRepository } from '../../../domain/repositories/patient.repository';
import { USER_REPOSITORY, UserRepository } from '../../../domain/repositories/user.repository';

const PATIENT_CODE_GENERATION_ATTEMPTS = 5;
const BCRYPT_ROUNDS = 10;

export interface CreatePatientInput extends CreatePatientRequestDto {
  actorId: string;
}

@Injectable()
export class CreatePatientUseCase {
  constructor(
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: PatientRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(MEDICAL_RECORD_REPOSITORY) private readonly medicalRecordRepository: MedicalRecordRepository,
    @Inject(AUDIT_LOG_PORT) private readonly auditLog: AuditLogPort,
  ) {}

  async execute(input: CreatePatientInput): Promise<PatientResponseDto> {
    const existingEmail = await this.patientRepository.findByEmail(input.email);
    if (existingEmail) throw new ConflictError('Email', { field: 'email' });

    const existingIdCard = await this.patientRepository.findByIdCard(input.idCard);
    if (existingIdCard) throw new ConflictError('CCCD/CMND', { field: 'idCard' });

    // Business Rule (changed 2026-07-19): every walk-in patient the
    // Receptionist registers now automatically gets a login too — no more
    // opt-in checkbox/typed password. The account starts with a fixed
    // system default password and mustChangePassword: true, so the patient
    // is forced to set their own on first login rather than the shared
    // default ever being a standing credential. Email is mandatory (see the
    // DTO) so it's used as-is here — no synthetic fallback identifier
    // needed, since LoginUseCase accepts email, phone, or idCard directly.
    const existingUserByEmail = await this.userRepository.findByEmail(input.email);
    if (existingUserByEmail) throw new ConflictError('Email', { field: 'email' });

    const existingUserByPhone = await this.userRepository.findByPhone(input.phone);
    if (existingUserByPhone) throw new ConflictError('Số điện thoại', { field: 'phone' });

    // idCard now also lands on users.id_card (unique), not just
    // patients.id_card checked above — a staff member sharing the same real
    // CCCD (e.g. also a patient here) would otherwise hit an unhandled
    // unique-constraint error instead of a clean ConflictError.
    const existingUserByIdCard = await this.userRepository.findByIdCard(input.idCard);
    if (existingUserByIdCard) throw new ConflictError('CCCD/CMND', { field: 'idCard' });

    const passwordHash = await bcrypt.hash(DEFAULT_PATIENT_PASSWORD, BCRYPT_ROUNDS);
    const newUser = await this.userRepository.create({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: UserRole.PATIENT,
      mustChangePassword: true,
      idCard: input.idCard,
    });
    const newUserId = newUser.id;

    let createdPatient: Awaited<ReturnType<PatientRepository['create']>> | null = null;

    for (let attempt = 0; attempt < PATIENT_CODE_GENERATION_ATTEMPTS; attempt += 1) {
      try {
        createdPatient = await this.patientRepository.create({
          patientCode: PatientCode.generate().value,
          fullName: input.fullName,
          email: input.email,
          dateOfBirth: input.dateOfBirth,
          gender: input.gender,
          phone: input.phone,
          idCard: input.idCard,
          address: input.address,
          note: input.note,
          notificationConsent: input.notificationConsent,
          userId: newUserId,
          createdBy: input.actorId,
        });
        break;
      } catch (error) {
        const isLastAttempt = attempt === PATIENT_CODE_GENERATION_ATTEMPTS - 1;
        if (isLastAttempt) throw error;
      }
    }

    if (!createdPatient) throw new ConflictError('Mã bệnh nhân');

    await this.medicalRecordRepository.upsertByPatientId({
      patientId: createdPatient.id,
      updatedBy: input.actorId,
    });

    await this.auditLog.write({
      userId: input.actorId,
      action: 'CREATE',
      module: 'PATIENT',
      targetId: createdPatient.id,
      detail: { patientCode: createdPatient.patientCode },
    });

    return toPatientResponse(createdPatient);
  }
}
