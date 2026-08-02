import { Inject, Injectable } from '@nestjs/common';
import { AppointmentSlotDto, AvailableDoctorDto } from '../../dtos/appointments/available-doctors-response.dto';
import { ResourceNotFoundError, ServiceSpecialtyMissingError } from '../../errors/application-error';
import {
  APPOINTMENT_REPOSITORY,
  AppointmentRepository,
} from '../../../domain/repositories/appointment.repository';
import { SERVICE_REPOSITORY, ServiceRepository } from '../../../domain/repositories/service.repository';
import { USER_REPOSITORY, UserRepository } from '../../../domain/repositories/user.repository';
import {
  WORK_SCHEDULE_REPOSITORY,
  WorkScheduleRepository,
} from '../../../domain/repositories/work-schedule.repository';
import { SHIFT_HOURS } from '../../../infrastructure/persistence/repositories/prisma-work-schedule.repository';
import { AppointmentStatus } from '../../../domain/enums/appointment-status.enum';
import { ShiftType } from '../../../domain/enums/shift-type.enum';
import { APPOINTMENT_SLOT_MINUTES } from '../../../domain/constants/appointment-slot.constant';
import { nowAsClinicNaiveUtc } from '../../../domain/services/clinic-calendar.util';
import { DoctorDisplayName } from '../../../domain/value-objects/doctor-display-name.vo';

export interface FindAvailableDoctorsInput {
  serviceId: string;
  date: Date;
}

export function toDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function buildSlots(
  day: Date,
  startHour: number,
  endHour: number,
  bookedTimes: Set<number>,
): AppointmentSlotDto[] {
  const slots: AppointmentSlotDto[] = [];
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;
  const now = nowAsClinicNaiveUtc();

  for (let minutes = startMinutes; minutes < endMinutes; minutes += APPOINTMENT_SLOT_MINUTES) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const slotDate = new Date(
      Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour, minute),
    );
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    slots.push({
      time,
      datetime: slotDate.toISOString(),
      // Business Rule: a slot that has already passed cannot be booked, even
      // if nothing is booked into it yet.
      available: slotDate.getTime() > now.getTime() && !bookedTimes.has(slotDate.getTime()),
    });
  }

  return slots;
}

@Injectable()
export class FindAvailableDoctorsUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY) private readonly serviceRepository: ServiceRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(WORK_SCHEDULE_REPOSITORY) private readonly workScheduleRepository: WorkScheduleRepository,
    @Inject(APPOINTMENT_REPOSITORY) private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(input: FindAvailableDoctorsInput): Promise<AvailableDoctorDto[]> {
    const service = await this.serviceRepository.findById(input.serviceId);
    if (!service) throw new ResourceNotFoundError('Service', { id: input.serviceId });

    // Business Rule: a service maps to exactly one specialty; a service with
    // no specialty assigned cannot be used to filter doctors for booking.
    if (!service.specialtyId) throw new ServiceSpecialtyMissingError();

    const doctors = await this.userRepository.findDoctorsBySpecialty(service.specialtyId);
    if (doctors.length === 0) return [];

    const day = toDateOnly(input.date);

    const results = await Promise.all(
      doctors.map(async (doctor) => {
        const shifts = await this.workScheduleRepository.findMany({
          userId: doctor.id,
          from: day,
          to: day,
        });

        // Fetch each doctor's existing appointments on this date once (not per
        // shift) and exclude CANCELLED ones — a cancelled appointment must not
        // block its slot from being booked again.
        const { items: appointmentItems } =
          shifts.length > 0
            ? await this.appointmentRepository.findMany({ doctorId: doctor.id, date: day, page: 1, limit: 200 })
            : { items: [] };
        const bookedTimes = new Set(
          appointmentItems
            .filter((item) => item.appointment.status !== AppointmentStatus.CANCELLED)
            .map((item) => item.appointment.appointmentTime.getTime()),
        );

        return {
          doctorId: doctor.id,
          doctorName: DoctorDisplayName.format(doctor.fullName),
          shifts: shifts.map((item) => {
            const shiftType = item.schedule.shift as ShiftType;
            const { startHour, endHour } = SHIFT_HOURS[shiftType];
            return {
              shift: shiftType,
              roomId: item.schedule.roomId,
              roomName: item.roomName,
              startHour,
              endHour,
              slots: buildSlots(day, startHour, endHour, bookedTimes),
            };
          }),
        };
      }),
    );

    // Business Rule: only doctors with at least one shift on the given date
    // are returned — a doctor matching the specialty but not scheduled that
    // day is not "available" for booking.
    return results.filter((doctor) => doctor.shifts.length > 0);
  }
}
