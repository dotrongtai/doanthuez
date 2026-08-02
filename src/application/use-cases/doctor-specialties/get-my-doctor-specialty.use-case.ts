import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  DoctorSpecialtyProfileResponseDto,
  PendingDoctorSpecialtyUpdateResponseDto,
} from '../../dtos/doctor-specialties/doctor-specialty-response.dto';
import { ResourceNotFoundError } from '../../errors/application-error';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { DoctorDisplayName } from '../../../domain/value-objects/doctor-display-name.vo';
import { PrismaService } from '../../../infrastructure/persistence/prisma/prisma.service';

const doctorSpecialtyInclude = {
  doctorProfile: {
    include: {
      specialty: true,
      certificationFiles: true,
      pendingUpdate: {
        include: {
          specialty: true,
        },
      },
    },
  },
} satisfies Prisma.UserInclude;

type DoctorUserWithProfile = Prisma.UserGetPayload<{
  include: typeof doctorSpecialtyInclude;
}>;

@Injectable()
export class GetMyDoctorSpecialtyUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<DoctorSpecialtyProfileResponseDto> {
    const row = await this.prisma.user.findFirst({
      where: {
        id: userId,
        role: UserRole.DOCTOR,
        deletedAt: null,
      },
      include: doctorSpecialtyInclude,
    });

    if (!row) throw new ResourceNotFoundError('Doctor');

    return this.toDto(row);
  }

  private toDto(row: DoctorUserWithProfile): DoctorSpecialtyProfileResponseDto {
    return {
      id: row.doctorProfile?.id ?? null,
      userId: row.id,
      fullName: DoctorDisplayName.format(row.fullName),
      email: row.email,
      phone: row.phone,
      isActive: row.isActive,
      specialtyId: row.doctorProfile?.specialtyId ?? null,
      specialtyName: row.doctorProfile?.specialty?.name ?? null,
      specialtyDescription: row.doctorProfile?.specialty?.description ?? null,
      subspecialty: row.doctorProfile?.subspecialty ?? null,
      degree: row.doctorProfile?.degree ?? null,
      certification: row.doctorProfile?.certification ?? null,
      certificationFiles:
        row.doctorProfile?.certificationFiles.map((file) => ({
          id: file.id,
          fileUrl: file.fileUrl,
          originalName: file.originalName,
          uploadedAt: file.uploadedAt.toISOString(),
        })) ?? [],
      yearsExperience: row.doctorProfile?.yearsExperience ?? null,
      biography: row.doctorProfile?.biography ?? null,
      avatarUrl: row.doctorProfile?.avatarUrl ?? null,
      approvalStatus: row.doctorProfile?.approvalStatus ?? null,
      pendingUpdate: row.doctorProfile?.pendingUpdate ? this.toPendingDto(row.doctorProfile.pendingUpdate) : null,
      updatedAt: row.doctorProfile?.updatedAt.toISOString() ?? null,
    };
  }

  private toPendingDto(
    row: NonNullable<NonNullable<DoctorUserWithProfile['doctorProfile']>['pendingUpdate']>,
  ): PendingDoctorSpecialtyUpdateResponseDto {
    return {
      id: row.id,
      specialtyId: row.specialtyId,
      specialtyName: row.specialty?.name ?? null,
      subspecialty: row.subspecialty,
      degree: row.degree,
      certification: row.certification,
      certificationFileUrls: this.parseCertificationFileUrls(row.certificationFileUrls),
      yearsExperience: row.yearsExperience,
      biography: row.biography,
      avatarUrl: row.avatarUrl,
      status: row.status,
      submittedAt: row.submittedAt.toISOString(),
      rejectionReason: row.rejectionReason,
    };
  }

  private parseCertificationFileUrls(value: string | null): string[] {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
    } catch {
      return [];
    }
  }
}
