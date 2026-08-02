import { Injectable } from '@nestjs/common';
import { Appointment as PrismaAppointment, Prisma } from '@prisma/client';
import { CONFIRMED_STALE_MINUTES } from '../../../domain/constants/appointment-slot.constant';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { Visit } from '../../../domain/entities/visit.entity';
import { AppointmentStatus } from '../../../domain/enums/appointment-status.enum';
import { VisitPriority } from '../../../domain/enums/visit-priority.enum';
import { VisitStatus } from '../../../domain/enums/visit-status.enum';
import { DoctorDisplayName } from '../../../domain/value-objects/doctor-display-name.vo';
import {
  AppointmentHistoryEntry,
  AppointmentListFilter,
  AppointmentListItem,
  AppointmentRepository,
  CheckInData,
  CheckInResult,
  CreateAppointmentData,
  CreateVisitData,
  UpdateAppointmentData,
} from '../../../domain/repositories/appointment.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Appointment | null> {
    const row = await this.prisma.appointment.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findConflict(patientId: string, appointmentTime: Date, excludeId?: string): Promise<Appointment | null> {
    const row = await this.prisma.appointment.findFirst({
      where: {
        patientId,
        appointmentTime,
        status: { notIn: this.nonBlockingStatuses(appointmentTime) },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return row ? this.toDomain(row) : null;
  }

  async findDoctorConflict(doctorId: string, appointmentTime: Date, excludeId?: string): Promise<Appointment | null> {
    const row = await this.prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentTime,
        status: { notIn: this.nonBlockingStatuses(appointmentTime) },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return row ? this.toDomain(row) : null;
  }

  // Feature 59 business rule (added 2026-07-08): a Confirmed appointment
  // more than CONFIRMED_STALE_MINUTES past its own appointment_time without
  // being checked in no longer blocks that slot. Every conflict query above
  // pins appointmentTime to the exact requested slot, so staleness reduces
  // to comparing "now" against that one fixed value.
  private nonBlockingStatuses(appointmentTime: Date): AppointmentStatus[] {
    const isStaleConfirmed = Date.now() - appointmentTime.getTime() > CONFIRMED_STALE_MINUTES * 60 * 1000;
    return isStaleConfirmed
      ? [AppointmentStatus.CANCELLED, AppointmentStatus.CONFIRMED]
      : [AppointmentStatus.CANCELLED];
  }

  async findMany(filter: AppointmentListFilter): Promise<{ items: AppointmentListItem[]; total: number }> {
    const search = filter.search?.trim();

    const where: Prisma.AppointmentWhereInput = {
      ...(filter.doctorId ? { doctorId: filter.doctorId } : {}),
      ...(filter.patientId ? { patientId: filter.patientId } : {}),
      ...(filter.statuses?.length ? { status: { in: filter.statuses } } : {}),
      ...(filter.date
        ? {
            appointmentTime: {
              gte: new Date(
                Date.UTC(filter.date.getUTCFullYear(), filter.date.getUTCMonth(), filter.date.getUTCDate()),
              ),
              lt: new Date(
                Date.UTC(filter.date.getUTCFullYear(), filter.date.getUTCMonth(), filter.date.getUTCDate() + 1),
              ),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { patient: { fullName: { contains: search } } },
              { patient: { patientCode: { contains: search } } },
              { patient: { phone: { contains: search } } },
              { doctor: { fullName: { contains: search } } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        include: {
          patient: true,
          doctor: true,
          service: true,
          visit: { select: { id: true } },
          room: { select: { name: true } },
        },
        orderBy: { appointmentTime: filter.sort ?? 'asc' },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    const items: AppointmentListItem[] = rows.map((row) => ({
      appointment: this.toDomain(row),
      patientName: row.patient.fullName,
      patientCode: row.patient.patientCode,
      doctorName: row.doctor ? DoctorDisplayName.format(row.doctor.fullName) : '',
      serviceName: row.service?.name ?? '',
      visitId: row.visit?.id ?? null,
      roomName: row.room?.name ?? null,
    }));

    return { items, total };
  }

  async create(data: CreateAppointmentData): Promise<Appointment> {
    const row = await this.prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId ?? null,
        serviceId: data.serviceId ?? null,
        scheduleId: data.scheduleId ?? null,
        appointmentTime: data.appointmentTime,
        status: data.status,
        note: data.note ?? null,
        bookedBy: data.bookedBy,
      },
    });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateAppointmentData): Promise<Appointment> {
    const row = await this.prisma.appointment.update({
      where: { id },
      data: {
        ...(data.doctorId !== undefined && { doctorId: data.doctorId }),
        ...(data.serviceId !== undefined && { serviceId: data.serviceId }),
        ...(data.scheduleId !== undefined && { scheduleId: data.scheduleId }),
        ...(data.appointmentTime !== undefined && { appointmentTime: data.appointmentTime }),
        ...(data.note !== undefined && { note: data.note }),
      },
    });
    return this.toDomain(row);
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    extra?: {
      cancelReason?: string | null;
      cancelledBy?: string | null;
      cancelledAt?: Date | null;
      checkedInAt?: Date | null;
      roomId?: string | null;
    },
  ): Promise<Appointment> {
    const row = await this.prisma.appointment.update({
      where: { id },
      data: {
        status,
        ...(extra?.cancelReason !== undefined && { cancelReason: extra.cancelReason }),
        ...(extra?.cancelledBy !== undefined && { cancelledBy: extra.cancelledBy }),
        ...(extra?.cancelledAt !== undefined && { cancelledAt: extra.cancelledAt }),
        ...(extra?.checkedInAt !== undefined && { checkedInAt: extra.checkedInAt }),
        ...(extra?.roomId !== undefined && { roomId: extra.roomId }),
      },
    });
    return this.toDomain(row);
  }

  async addHistory(entry: AppointmentHistoryEntry): Promise<void> {
    await this.prisma.appointmentHistory.create({
      data: {
        appointmentId: entry.appointmentId,
        oldStatus: entry.oldStatus ?? null,
        newStatus: entry.newStatus,
        oldTime: entry.oldTime ?? null,
        newTime: entry.newTime ?? null,
        oldDoctorId: entry.oldDoctorId ?? null,
        newDoctorId: entry.newDoctorId ?? null,
        reason: entry.reason ?? null,
        changedBy: entry.changedBy,
      },
    });
  }

  async cancelStaleBefore(cutoff: Date, systemActorId: string): Promise<number> {
    const stale = await this.prisma.appointment.findMany({
      where: {
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        appointmentTime: { lt: cutoff },
      },
      select: { id: true, status: true },
    });
    if (stale.length === 0) return 0;

    const cancelledAt = new Date();
    const reason = 'Tự động hủy do hết ngày mà chưa được xác nhận/check-in';
    await this.prisma.$transaction(
      stale.flatMap((appt) => [
        this.prisma.appointment.update({
          where: { id: appt.id },
          data: {
            status: AppointmentStatus.CANCELLED,
            cancelReason: reason,
            cancelledBy: systemActorId,
            cancelledAt,
          },
        }),
        this.prisma.appointmentHistory.create({
          data: {
            appointmentId: appt.id,
            oldStatus: appt.status,
            newStatus: AppointmentStatus.CANCELLED,
            reason,
            changedBy: systemActorId,
          },
        }),
      ]),
    );
    return stale.length;
  }

  async createVisit(data: CreateVisitData): Promise<Visit> {
    const room = await this.prisma.room.findUniqueOrThrow({ where: { id: data.roomId } });
    const { start, end } = this.todayRangeUtc();
    const countToday = await this.prisma.visit.count({
      where: { roomId: data.roomId, createdAt: { gte: start, lt: end } },
    });

    const row = await this.prisma.visit.create({
      data: {
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        roomId: data.roomId,
        queueNumber: this.formatQueueNumber(room.roomCode, countToday + 1),
        priority: data.priority ?? VisitPriority.NORMAL,
        status: VisitStatus.WAITING,
      },
    });

    return new Visit(
      row.id,
      row.appointmentId,
      row.patientId,
      row.doctorId,
      row.roomId,
      row.queueNumber,
      row.priority as VisitPriority,
      row.status as VisitStatus,
      row.calledAt,
      row.calledCount,
      row.startedAt,
      row.completedAt,
      row.createdAt,
    );
  }

  async checkIn(data: CheckInData): Promise<CheckInResult> {
    return this.prisma.$transaction(async (tx) => {
      const appointmentRow = await tx.appointment.update({
        where: { id: data.appointmentId },
        data: {
          status: AppointmentStatus.CHECKED_IN,
          checkedInAt: data.checkedInAt,
          roomId: data.roomId,
        },
      });

      await tx.appointmentHistory.create({
        data: {
          appointmentId: data.appointmentId,
          oldStatus: data.oldStatus,
          newStatus: AppointmentStatus.CHECKED_IN,
          changedBy: data.changedBy,
        },
      });

      // Locks the room row so two concurrent check-ins for the same room
      // serialize instead of both reading the same countToday and minting
      // the same queueNumber (queue_number has no unique constraint — it
      // intentionally resets per day, see schema.prisma comment on Visit).
      await tx.$queryRaw`SELECT id FROM rooms WHERE id = ${data.roomId} FOR UPDATE`;
      const room = await tx.room.findUniqueOrThrow({ where: { id: data.roomId } });
      const { start, end } = this.todayRangeUtc();
      const countToday = await tx.visit.count({
        where: { roomId: data.roomId, createdAt: { gte: start, lt: end } },
      });

      const visitRow = await tx.visit.create({
        data: {
          appointmentId: data.appointmentId,
          patientId: data.patientId,
          doctorId: data.doctorId,
          roomId: data.roomId,
          queueNumber: this.formatQueueNumber(room.roomCode, countToday + 1),
          priority: data.priority ?? VisitPriority.NORMAL,
          status: VisitStatus.WAITING,
        },
      });

      return {
        appointment: this.toDomain(appointmentRow),
        visit: new Visit(
          visitRow.id,
          visitRow.appointmentId,
          visitRow.patientId,
          visitRow.doctorId,
          visitRow.roomId,
          visitRow.queueNumber,
          visitRow.priority as VisitPriority,
          visitRow.status as VisitStatus,
          visitRow.calledAt,
          visitRow.calledCount,
          visitRow.startedAt,
          visitRow.completedAt,
          visitRow.createdAt,
        ),
      };
    });
  }

  // Reset lúc 00:00 UTC — nhất quán với cách lọc theo ngày trong findMany().
  private todayRangeUtc(): { start: Date; end: Date } {
    const now = new Date();
    return {
      start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())),
      end: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)),
    };
  }

  private formatQueueNumber(roomCode: string, sequence: number): string {
    return `${roomCode}-${String(sequence).padStart(3, '0')}`;
  }

  private toDomain(row: PrismaAppointment): Appointment {
    return new Appointment(
      row.id,
      row.patientId,
      row.doctorId,
      row.serviceId,
      row.roomId,
      row.scheduleId,
      row.appointmentTime,
      row.status as AppointmentStatus,
      row.note,
      row.cancelReason,
      row.cancelledBy,
      row.cancelledAt,
      row.checkedInAt,
      row.bookedBy,
      row.createdAt,
      row.updatedAt,
    );
  }
}
