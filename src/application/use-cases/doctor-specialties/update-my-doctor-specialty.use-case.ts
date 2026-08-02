import { Injectable } from '@nestjs/common';
import { DoctorProfileApprovalStatus, Prisma } from '@prisma/client';
import { UpdateDoctorSpecialtyDto } from '../../dtos/doctor-specialties/update-doctor-specialty.dto';
import {
  DoctorSpecialtyProfileResponseDto,
  PendingDoctorSpecialtyUpdateResponseDto,
} from '../../dtos/doctor-specialties/doctor-specialty-response.dto';
import { ApplicationError, ResourceNotFoundError } from '../../errors/application-error';
import { MSG } from '../../../domain/value-objects/message-code.vo';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { DoctorDisplayName } from '../../../domain/value-objects/doctor-display-name.vo';
import { PrismaService } from '../../../infrastructure/persistence/prisma/prisma.service';

const doctorProfileInclude = {
  user: true,
  specialty: true,
  certificationFiles: true,
  pendingUpdate: {
    include: {
      specialty: true,
    },
  },
} satisfies Prisma.DoctorProfileInclude;

type DoctorProfileWithRelations = Prisma.DoctorProfileGetPayload<{
  include: typeof doctorProfileInclude;
}>;

@Injectable()
export class UpdateMyDoctorSpecialtyUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, input: UpdateDoctorSpecialtyDto): Promise<DoctorSpecialtyProfileResponseDto> {
    const [user, specialty] = await Promise.all([
      this.prisma.user.findFirst({
        where: {
          id: userId,
          role: UserRole.DOCTOR,
          isActive: true,
          deletedAt: null,
        },
      }),
      this.prisma.specialty.findUnique({
        where: { id: input.specialtyId },
      }),
    ]);

    if (!user) throw new ResourceNotFoundError('Doctor');
    if (!specialty) throw new ApplicationError(MSG.ERR_0006, 400);

    const profile = await this.prisma.doctorProfile.upsert({
      where: { userId },
      create: {
        userId,
        approvalStatus: DoctorProfileApprovalStatus.PENDING_APPROVAL,
        updatedBy: userId,
      },
      update: {
        updatedBy: userId,
      },
    });

    await this.prisma.doctorProfilePendingUpdate.upsert({
      where: { doctorProfileId: profile.id },
      create: {
        doctorProfileId: profile.id,
        specialtyId: input.specialtyId,
        subspecialty: input.subspecialty?.trim() || null,
        degree: input.degree?.trim() || null,
        certification: input.certification?.trim() || null,
        certificationFileUrls: this.serializeCertificationFileUrls(input.certificationFileUrls),
        yearsExperience: input.yearsExperience ?? null,
        biography: input.biography?.trim() || null,
        avatarUrl: input.avatarUrl?.trim() || null,
        status: DoctorProfileApprovalStatus.PENDING_APPROVAL,
        submittedBy: userId,
      },
      update: {
        specialtyId: input.specialtyId,
        subspecialty: input.subspecialty?.trim() || null,
        degree: input.degree?.trim() || null,
        certification: input.certification?.trim() || null,
        certificationFileUrls: this.serializeCertificationFileUrls(input.certificationFileUrls),
        yearsExperience: input.yearsExperience ?? null,
        biography: input.biography?.trim() || null,
        avatarUrl: input.avatarUrl?.trim() || null,
        status: DoctorProfileApprovalStatus.PENDING_APPROVAL,
        submittedBy: userId,
        submittedAt: new Date(),
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
      },
    });

    const row = await this.prisma.doctorProfile.findUniqueOrThrow({
      where: { id: profile.id },
      include: doctorProfileInclude,
    });

    return this.toDto(row);
  }

  private toDto(row: DoctorProfileWithRelations): DoctorSpecialtyProfileResponseDto {
    return {
      id: row.id,
      userId: row.userId,
      fullName: DoctorDisplayName.format(row.user.fullName),
      email: row.user.email,
      phone: row.user.phone,
      isActive: row.user.isActive,
      specialtyId: row.specialtyId,
      specialtyName: row.specialty?.name ?? null,
      specialtyDescription: row.specialty?.description ?? null,
      subspecialty: row.subspecialty,
      degree: row.degree,
      certification: row.certification,
      certificationFiles: row.certificationFiles.map((file) => ({
        id: file.id,
        fileUrl: file.fileUrl,
        originalName: file.originalName,
        uploadedAt: file.uploadedAt.toISOString(),
      })),
      yearsExperience: row.yearsExperience,
      biography: row.biography,
      avatarUrl: row.avatarUrl,
      approvalStatus: row.approvalStatus,
      pendingUpdate: row.pendingUpdate ? this.toPendingDto(row.pendingUpdate) : null,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private toPendingDto(
    row: NonNullable<DoctorProfileWithRelations['pendingUpdate']>,
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

  private serializeCertificationFileUrls(value?: string[]): string | null {
    const urls = value?.map((url) => url.trim()).filter(Boolean) ?? [];
    return urls.length ? JSON.stringify(urls) : null;
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
