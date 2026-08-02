import { AppointmentResponseDto } from './appointment-response.dto';
import { VisitPriority } from '../../../domain/enums/visit-priority.enum';
import { VisitStatus } from '../../../domain/enums/visit-status.enum';

export interface VisitResponseDto {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  roomId: string;
  queueNumber: string | null;
  priority: VisitPriority;
  status: VisitStatus;
  createdAt: Date;
}

export interface CheckInResponseDto {
  appointment: AppointmentResponseDto;
  visit: VisitResponseDto;
}
