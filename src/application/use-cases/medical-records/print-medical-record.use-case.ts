import { Injectable } from '@nestjs/common';
import { PrintMedicalRecordResponseDto } from '../../dtos/medical-records/print-medical-record-response.dto';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { VisitStatus } from '../../../domain/enums/visit-status.enum';
import { GetMedicalRecordUseCase } from './get-medical-record.use-case';

export interface PrintMedicalRecordInput {
  patientId: string;
  visitIds?: string[];
  actorId: string;
  actorRole: UserRole;
}

@Injectable()
export class PrintMedicalRecordUseCase {
  constructor(private readonly getMedicalRecordUseCase: GetMedicalRecordUseCase) {}

  async execute(input: PrintMedicalRecordInput): Promise<PrintMedicalRecordResponseDto> {
    const detail = await this.getMedicalRecordUseCase.execute({
      patientId: input.patientId,
      actorId: input.actorId,
      actorRole: input.actorRole,
    });

    // Only visits whose exam actually concluded count as printable history —
    // a visit still waiting/checked-in/in-progress, or an appointment never
    // checked in at all, isn't a finished record yet (see the same rule
    // applied to the on-screen "Lịch sử khám" list).
    const completedVisits = detail.visits.filter((visit) => visit.status === VisitStatus.COMPLETED);

    // Business Rule (Feature 66): printing without selecting any visit
    // defaults to including all (completed) visits; selecting one or more
    // visitIds filters the printed record to only those visits.
    const visits =
      input.visitIds && input.visitIds.length > 0
        ? completedVisits.filter((visit) => input.visitIds!.includes(visit.id))
        : completedVisits;

    return {
      patient: detail.patient,
      allergies: detail.allergies,
      visits,
    };
  }
}
