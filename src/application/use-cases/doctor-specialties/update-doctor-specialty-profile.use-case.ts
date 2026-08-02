import { Injectable } from '@nestjs/common';
import { DoctorProfileApprovalStatus, Prisma } from '@prisma/client';
import { UpdateDoctorSpecialtyDto } from '../../dtos/doctor-specialties/update-doctor-specialty.dto';
import { DoctorSpecialtyProfileResponseDto } from '../../dtos/doctor-specialties/doctor-specialty-response.dto';
import { ApplicationError, ResourceNotFoundError } from '../../errors/application-error';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { MSG } from '../../../domain/value-objects/message-code.vo';
import { DoctorDisplayName } from '../../../domain/value-objects/doctor-display-name.vo';
import { PrismaService } from '../../../infrastructure/persistence/prisma/prisma.service';

const doctorProfileInclude = {
  user: true,
  specialty: true,
  certificationFiles: true,
} satisfies Prisma.DoctorProfileInclude;

type DoctorProfileWithRelations = Prisma.DoctorProfileGetPayload<{
  include: typeof doctorProfileInclude;
}>;

@Injectable()
export class UpdateDoctorSpecialtyProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    doctorUserId: string,
    updatedBy: string,
    input: UpdateDoctorSpecialtyDto,
  ): Promise<DoctorSpecialtyProfileResponseDto> {
    const [doctor, specialty] = await Promise.all([
      this.prisma.user.findFirst({
        where: {
          id: doctorUserId,
          role: UserRole.DOCTOR,
          deletedAt: null,
        },
      }),
      this.prisma.specialty.findUnique({
        where: { id: input.specialtyId },
      }),
    ]);

    if (!doctor) throw new ResourceNotFoundError('Doctor');
    if (!specialty) throw new ApplicationError(MSG.ERR_0006, 400);

    const row = await this.prisma.$transaction(async (tx) => {
      const profile = await tx.doctorProfile.upsert({
        where: { userId: doctorUserId },
        create: {
          userId: doctorUserId,
          specialtyId: input.specialtyId,
          subspecialty: input.subspecialty?.trim() || null,
          degree: input.degree?.trim() || null,
          certification: input.certification?.trim() || null,
          yearsExperience: input.yearsExperience ?? null,
          biography: input.biography?.trim() || null,
          avatarUrl: input.avatarUrl?.trim() || null,
          approvalStatus: DoctorProfileApprovalStatus.APPROVED,
          approvedAt: new Date(),
          approvedBy: updatedBy,
          rejectedAt: null,
          rejectedBy: null,
          rejectionReason: null,
          updatedBy,
        },
        update: {
          specialtyId: input.specialtyId,
          subspecialty: input.subspecialty?.trim() || null,
          degree: input.degree?.trim() || null,
          certification: input.certification?.trim() || null,
          yearsExperience: input.yearsExperience ?? null,
          biography: input.biography?.trim() || null,
          avatarUrl: input.avatarUrl?.trim() || null,
          approvalStatus: DoctorProfileApprovalStatus.APPROVED,
          approvedAt: new Date(),
          approvedBy: updatedBy,
          rejectedAt: null,
          rejectedBy: null,
          rejectionReason: null,
          updatedBy,
        },
      });

      await tx.doctorProfilePendingUpdate.deleteMany({ where: { doctorProfileId: profile.id } });

      if (input.certificationFileUrls) {
        await tx.doctorCertificationFile.deleteMany({ where: { doctorProfileId: profile.id } });
        const files = input.certificationFileUrls
          .map((url) => url.trim())
          .filter(Boolean)
          .map((url) => ({
            doctorProfileId: profile.id,
            fileUrl: url,
            originalName: this.getFileNameFromUrl(url),
            uploadedBy: updatedBy,
          }));
        if (files.length) await tx.doctorCertificationFile.createMany({ data: files });
      }

      return tx.doctorProfile.findUniqueOrThrow({
        where: { id: profile.id },
        include: doctorProfileInclude,
      });
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
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private getFileNameFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      const fileName = parsed.pathname.split('/').filter(Boolean).pop();
      return fileName ? decodeURIComponent(fileName).slice(0, 255) : null;
    } catch {
      return null;
    }
  }
}
