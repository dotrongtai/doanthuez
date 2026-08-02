import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../../domain/repositories/user.repository';
import { PATIENT_REPOSITORY, PatientRepository } from '../../../domain/repositories/patient.repository';
import { ResourceNotFoundError } from '../../errors/application-error';
import { UserProfileResponseDto } from '../../dtos/users/user-profile.dto';
import { UserRole } from '../../../domain/enums/user-role.enum';

@Injectable()
export class GetMyProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: PatientRepository,
  ) {}

  async execute(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new ResourceNotFoundError('User');

    // Patients don't have users.id_card populated (staff-only column) —
    // their CCCD/CMND lives on the linked patients row instead.
    const idCard =
      user.role === UserRole.PATIENT
        ? (await this.patientRepository.findByUserId(user.id))?.idCard ?? null
        : user.idCard;

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      idCard,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
    };
  }
}
