import { Inject, Injectable } from '@nestjs/common';
import { AUDIT_LOG_PORT, AuditLogPort } from '../../ports/audit-log.port';
import { UpdateMedicalRecordRequestDto } from '../../dtos/medical-records/update-medical-record.dto';
import { MedicalRecordDetailDto, toMedicalRecordDetailDto } from '../../dtos/medical-records/medical-record-response.dto';
import { ApplicationError, ResourceNotFoundError } from '../../errors/application-error';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { MSG } from '../../../domain/value-objects/message-code.vo';
import {
  MEDICAL_RECORD_REPOSITORY,
  MedicalRecordRepository,
} from '../../../domain/repositories/medical-record.repository';

export interface UpdateMedicalRecordInput extends UpdateMedicalRecordRequestDto {
  patientId: string;
  actorId: string;
  actorRole: UserRole;
}

@Injectable()
export class UpdateMedicalRecordUseCase {
  constructor(
    @Inject(MEDICAL_RECORD_REPOSITORY) private readonly medicalRecordRepository: MedicalRecordRepository,
    @Inject(AUDIT_LOG_PORT) private readonly auditLog: AuditLogPort,
  ) {}

  async execute(input: UpdateMedicalRecordInput): Promise<MedicalRecordDetailDto> {
    if (input.actorRole !== UserRole.DOCTOR) throw new ApplicationError(MSG.ERR_0008, 403);

    const canUpdate = await this.medicalRecordRepository.hasDoctorVisit(input.patientId, input.actorId, true);
    if (!canUpdate) throw new ApplicationError(MSG.ERR_0008, 403);

    await this.medicalRecordRepository.upsertByPatientId({
      patientId: input.patientId,
      medicalHistory: input.medicalHistory,
      clinicalNote: input.clinicalNote,
      diagnosisSummary: input.diagnosisSummary,
      treatmentSummary: input.treatmentSummary,
      followUpNote: input.followUpNote,
      updatedBy: input.actorId,
    });

    if (input.allergies) {
      await this.medicalRecordRepository.replaceAllergies({
        patientId: input.patientId,
        allergies: input.allergies,
        createdBy: input.actorId,
      });
    }

    await this.auditLog.write({
      userId: input.actorId,
      action: 'UPDATE',
      module: 'MEDICAL_RECORD',
      targetId: input.patientId,
    });

    const detail = await this.medicalRecordRepository.findDetail(input.patientId);
    if (!detail) throw new ResourceNotFoundError('Patient');

    return toMedicalRecordDetailDto(detail);
  }
}
