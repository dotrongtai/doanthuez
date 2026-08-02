import { Inject, Injectable } from '@nestjs/common';
import { MedicalRecordDetailDto, toMedicalRecordDetailDto } from '../../dtos/medical-records/medical-record-response.dto';
import { ApplicationError, ResourceNotFoundError } from '../../errors/application-error';
import { MSG } from '../../../domain/value-objects/message-code.vo';
import {
  MEDICAL_RECORD_REPOSITORY,
  MedicalRecordRepository,
} from '../../../domain/repositories/medical-record.repository';
import { PATIENT_REPOSITORY, PatientRepository } from '../../../domain/repositories/patient.repository';
import { UserRole } from '../../../domain/enums/user-role.enum';

export interface GetMedicalRecordInput {
  patientId: string;
  actorId: string;
  actorRole: UserRole;
}

@Injectable()
export class GetMedicalRecordUseCase {
  constructor(
    @Inject(MEDICAL_RECORD_REPOSITORY) private readonly medicalRecordRepository: MedicalRecordRepository,
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: PatientRepository,
  ) {}

  async execute(input: GetMedicalRecordInput): Promise<MedicalRecordDetailDto> {
    await this.ensureCanView(input);

    const detail = await this.medicalRecordRepository.findDetail(input.patientId);
    if (!detail) throw new ResourceNotFoundError('Patient');

    return toMedicalRecordDetailDto(detail);
  }

  async executeMine(userId: string): Promise<MedicalRecordDetailDto> {
    const patient = await this.patientRepository.findByUserId(userId);
    if (!patient) throw new ResourceNotFoundError('Patient');

    const detail = await this.medicalRecordRepository.findDetail(patient.id);
    if (!detail) throw new ResourceNotFoundError('Patient');

    return toMedicalRecordDetailDto(detail);
  }

  private async ensureCanView(input: GetMedicalRecordInput): Promise<void> {
    if (input.actorRole === UserRole.ADMIN || input.actorRole === UserRole.RECEPTIONIST) return;

    if (input.actorRole === UserRole.PATIENT) {
      const patient = await this.patientRepository.findByUserId(input.actorId);
      if (patient?.id === input.patientId) return;

      throw new ApplicationError(MSG.ERR_0008, 403);
    }

    const hasAccess = await this.medicalRecordRepository.hasDoctorVisit(input.patientId, input.actorId);
    if (!hasAccess) throw new ApplicationError(MSG.ERR_0008, 403);
  }
}
