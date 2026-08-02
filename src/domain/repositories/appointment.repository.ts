import { Appointment } from '../entities/appointment.entity';
import { Visit } from '../entities/visit.entity';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { VisitPriority } from '../enums/visit-priority.enum';

export const APPOINTMENT_REPOSITORY = Symbol('APPOINTMENT_REPOSITORY');

export interface CreateAppointmentData {
  patientId: string;
  doctorId?: string | null;
  serviceId?: string | null;
  scheduleId?: string | null;
  appointmentTime: Date;
  status: AppointmentStatus;
  note?: string | null;
  bookedBy: string;
}

export interface UpdateAppointmentData {
  doctorId?: string | null;
  serviceId?: string | null;
  scheduleId?: string | null;
  appointmentTime?: Date;
  note?: string | null;
}

export interface AppointmentListFilter {
  date?: Date;
  doctorId?: string;
  patientId?: string;
  statuses?: AppointmentStatus[];
  search?: string;
  page: number;
  limit: number;
  /**
   * Sort direction by appointmentTime. Feature 61 (receptionist list)
   * defaults to 'asc' (soonest appointment first); a patient's own "my
   * appointments" list defaults to 'desc' (most recently booked/newest date
   * first) — see ListAppointmentsUseCase for the role-based default.
   */
  sort?: 'asc' | 'desc';
}

export interface AppointmentListItem {
  appointment: Appointment;
  patientName: string;
  patientCode: string;
  doctorName: string;
  serviceName: string;
  /** The visit created at check-in (Feature 60), if any — lets the receptionist
   * re-print the admission slip later from the appointment detail screen
   * without a dedicated GET /visits endpoint (RECEPTIONIST can't call that one). */
  visitId: string | null;
  /** Resolved from appointment.roomId (only set once check-in has locked in
   * the room, see Feature 60) — null beforehand, matching roomId itself. */
  roomName: string | null;
}

export interface AppointmentHistoryEntry {
  appointmentId: string;
  oldStatus?: AppointmentStatus | null;
  newStatus: AppointmentStatus;
  oldTime?: Date | null;
  newTime?: Date | null;
  oldDoctorId?: string | null;
  newDoctorId?: string | null;
  reason?: string | null;
  changedBy: string;
}

export interface CreateVisitData {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  roomId: string;
  priority?: VisitPriority;
}

export interface CheckInData {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  roomId: string;
  priority?: VisitPriority;
  checkedInAt: Date;
  changedBy: string;
  oldStatus: AppointmentStatus;
}

export interface CheckInResult {
  appointment: Appointment;
  visit: Visit;
}

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findConflict(patientId: string, appointmentTime: Date, excludeId?: string): Promise<Appointment | null>;
  findDoctorConflict(doctorId: string, appointmentTime: Date, excludeId?: string): Promise<Appointment | null>;
  findMany(filter: AppointmentListFilter): Promise<{ items: AppointmentListItem[]; total: number }>;
  create(data: CreateAppointmentData): Promise<Appointment>;
  update(id: string, data: UpdateAppointmentData): Promise<Appointment>;
  updateStatus(
    id: string,
    status: AppointmentStatus,
    extra?: {
      cancelReason?: string | null;
      cancelledBy?: string | null;
      cancelledAt?: Date | null;
      checkedInAt?: Date | null;
      roomId?: string | null;
    },
  ): Promise<Appointment>;
  addHistory(entry: AppointmentHistoryEntry): Promise<void>;
  createVisit(data: CreateVisitData): Promise<Visit>;

  /**
   * End-of-day cleanup (Feature: auto-cancel): PENDING/CONFIRMED appointments
   * with appointmentTime before `cutoff` were never checked in — cancel them
   * and record history for each. Returns the number cancelled.
   */
  cancelStaleBefore(cutoff: Date, systemActorId: string): Promise<number>;

  /**
   * Atomically: updates the appointment to CHECKED_IN with the resolved
   * room/checkedInAt, inserts an AppointmentHistory row, and creates the
   * Visit(WAITING) with that room (auto-generated queueNumber, given
   * priority or NORMAL) — all three writes succeed together or none do.
   * Check-in no longer collects a deposit (removed 2026-07-19, see
   * Feature 60/91 changelog); the deposit feature itself was later removed
   * entirely (2026-07-26).
   */
  checkIn(data: CheckInData): Promise<CheckInResult>;
}
