import { Injectable } from '@nestjs/common';
import { DoctorProfileApprovalStatus, Prisma } from '@prisma/client';
import { ListPublicDoctorsQueryDto } from '../../dtos/public-doctors/list-public-doctors-query.dto';
import { PublicDoctorListItemDto } from '../../dtos/public-doctors/public-doctor-response.dto';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { DoctorDisplayName } from '../../../domain/value-objects/doctor-display-name.vo';
import { PrismaService } from '../../../infrastructure/persistence/prisma/prisma.service';

const doctorProfileInclude = {
  user: true,
  specialty: true,
} satisfies Prisma.DoctorProfileInclude;

type DoctorProfileWithRelations = Prisma.DoctorProfileGetPayload<{
  include: typeof doctorProfileInclude;
}>;

export function toPublicDoctorListItem(row: DoctorProfileWithRelations): PublicDoctorListItemDto {
  return {
    id: row.id,
    userId: row.userId,
    fullName: DoctorDisplayName.format(row.user.fullName),
    specialtyId: row.specialtyId,
    specialtyName: row.specialty?.name ?? null,
    subspecialty: row.subspecialty,
    degree: row.degree,
    yearsExperience: row.yearsExperience,
    biography: row.biography,
    avatarUrl: row.avatarUrl,
  };
}

@Injectable()
export class ListPublicDoctorsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListPublicDoctorsQueryDto = {}): Promise<PublicDoctorListItemDto[]> {
    const search = query.search?.trim();
    const degree = query.degree?.trim();
    const rows = await this.prisma.doctorProfile.findMany({
      where: {
        specialtyId: query.specialtyId?.trim() || { not: null },
        approvalStatus: DoctorProfileApprovalStatus.APPROVED,
        ...(query.minYearsExperience != null ? { yearsExperience: { gte: query.minYearsExperience } } : {}),
        ...(degree ? { degree: { contains: degree } } : {}),
        ...(search
          ? {
              OR: [
                { user: { fullName: { contains: search } } },
                { specialty: { is: { name: { contains: search } } } },
                { degree: { contains: search } },
              ],
            }
          : {}),
        // fullName search lives in the OR clause above (alongside specialty
        // name / degree) — it must NOT also be required here, or Prisma's
        // implicit top-level AND would force every match to also hit
        // fullName, defeating the "match by specialty OR degree" intent.
        user: {
          role: UserRole.DOCTOR,
          isActive: true,
          deletedAt: null,
        },
      },
      include: doctorProfileInclude,
      orderBy: [{ yearsExperience: 'desc' }, { user: { fullName: 'asc' } }],
    });

    return rows.map(toPublicDoctorListItem);
  }
}
