import { Inject, Injectable } from '@nestjs/common';
import { AUDIT_LOG_PORT, AuditLogPort } from '../../ports/audit-log.port';
import { UpdatePatientRequestDto } from '../../dtos/patients/update-patient.dto';
import { PatientResponseDto, toPatientResponse } from '../../dtos/patients/patient-response.dto';
import { ConflictError, ResourceNotFoundError } from '../../errors/application-error';
import { PATIENT_REPOSITORY, PatientRepository } from '../../../domain/repositories/patient.repository';

export interface UpdatePatientInput extends UpdatePatientRequestDto {
  id: string;
  actorId: string;
}

@Injectable()
export class UpdatePatientUseCase {
  constructor(
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: PatientRepository,
    @Inject(AUDIT_LOG_PORT) private readonly auditLog: AuditLogPort,
  ) {}

  async execute(input: UpdatePatientInput): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findById(input.id);
    if (!patient) throw new ResourceNotFoundError('Patient');

    if (input.email && input.email !== patient.email) {
      const existingEmail = await this.patientRepository.findByEmail(input.email);
      if (existingEmail && existingEmail.id !== patient.id) throw new ConflictError('Email', { field: 'email' });
    }

    if (input.idCard && input.idCard !== patient.idCard) {
      const existingIdCard = await this.patientRepository.findByIdCard(input.idCard);
      if (existingIdCard && existingIdCard.id !== patient.id) throw new ConflictError('CCCD/CMND', { field: 'idCard' });
    }

    const updated = await this.patientRepository.update(patient.id, {
      fullName: input.fullName,
      email: input.email,
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      phone: input.phone,
      idCard: input.idCard,
      address: input.address,
      note: input.note,
      notificationConsent: input.notificationConsent,
      updatedBy: input.actorId,
    });

    await this.auditLog.write({
      userId: input.actorId,
      action: 'UPDATE',
      module: 'PATIENT',
      targetId: updated.id,
      detail: { patientCode: updated.patientCode },
    });

    return toPatientResponse(updated);
  }
}
