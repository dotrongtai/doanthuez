import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { CreateSpecialtyDto } from '../../application/dtos/doctor-specialties/create-specialty.dto';
import { UpdateSpecialtyDto } from '../../application/dtos/doctor-specialties/update-specialty.dto';
import { ListDoctorSpecialtyProfilesQueryDto } from '../../application/dtos/doctor-specialties/list-doctor-specialty-profiles-query.dto';
import { RejectDoctorSpecialtyUpdateDto } from '../../application/dtos/doctor-specialties/reject-doctor-specialty-update.dto';
import { UpdateDoctorSpecialtyDto } from '../../application/dtos/doctor-specialties/update-doctor-specialty.dto';
import { ApproveDoctorSpecialtyUpdateUseCase } from '../../application/use-cases/doctor-specialties/approve-doctor-specialty-update.use-case';
import { CreateSpecialtyUseCase } from '../../application/use-cases/doctor-specialties/create-specialty.use-case';
import { DeleteSpecialtyUseCase } from '../../application/use-cases/doctor-specialties/delete-specialty.use-case';
import { GetMyDoctorSpecialtyUseCase } from '../../application/use-cases/doctor-specialties/get-my-doctor-specialty.use-case';
import { ListDoctorSpecialtyProfilesUseCase } from '../../application/use-cases/doctor-specialties/list-doctor-specialty-profiles.use-case';
import { ListSpecialtiesUseCase } from '../../application/use-cases/doctor-specialties/list-specialties.use-case';
import { RejectDoctorSpecialtyUpdateUseCase } from '../../application/use-cases/doctor-specialties/reject-doctor-specialty-update.use-case';
import { UpdateDoctorSpecialtyProfileUseCase } from '../../application/use-cases/doctor-specialties/update-doctor-specialty-profile.use-case';
import { UpdateMyDoctorSpecialtyUseCase } from '../../application/use-cases/doctor-specialties/update-my-doctor-specialty.use-case';
import { UpdateSpecialtyUseCase } from '../../application/use-cases/doctor-specialties/update-specialty.use-case';
import { UserRole } from '../../domain/enums/user-role.enum';
import { MSG } from '../../domain/value-objects/message-code.vo';
import { CurrentUser } from '../decorators/current-user.decorator';
import { MsgCode } from '../decorators/msg-code.decorator';
import { Roles } from '../decorators/roles.decorator';
import { AuthenticatedUser } from '../guards/authenticated-user.type';

@Controller('doctor-specialties')
export class DoctorSpecialtiesController {
  constructor(
    private readonly listSpecialtiesUseCase: ListSpecialtiesUseCase,
    private readonly createSpecialtyUseCase: CreateSpecialtyUseCase,
    private readonly updateSpecialtyUseCase: UpdateSpecialtyUseCase,
    private readonly deleteSpecialtyUseCase: DeleteSpecialtyUseCase,
    private readonly listDoctorSpecialtyProfilesUseCase: ListDoctorSpecialtyProfilesUseCase,
    private readonly getMyDoctorSpecialtyUseCase: GetMyDoctorSpecialtyUseCase,
    private readonly updateMyDoctorSpecialtyUseCase: UpdateMyDoctorSpecialtyUseCase,
    private readonly updateDoctorSpecialtyProfileUseCase: UpdateDoctorSpecialtyProfileUseCase,
    private readonly approveDoctorSpecialtyUpdateUseCase: ApproveDoctorSpecialtyUpdateUseCase,
    private readonly rejectDoctorSpecialtyUpdateUseCase: RejectDoctorSpecialtyUpdateUseCase,
  ) {}

  @Get('specialties')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.PATIENT)
  listSpecialties() {
    return this.listSpecialtiesUseCase.execute();
  }

  @Post('specialties')
  @Roles(UserRole.ADMIN)
  createSpecialty(@Body() dto: CreateSpecialtyDto) {
    return this.createSpecialtyUseCase.execute({ name: dto.name, description: dto.description });
  }

  @Put('specialties/:id')
  @Roles(UserRole.ADMIN)
  updateSpecialty(@Param('id') id: string, @Body() dto: UpdateSpecialtyDto) {
    return this.updateSpecialtyUseCase.execute({ id, name: dto.name, description: dto.description });
  }

  @Delete('specialties/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSpecialty(@Param('id') id: string): Promise<void> {
    await this.deleteSpecialtyUseCase.execute(id);
  }

  @Get('admin/doctors')
  @Roles(UserRole.ADMIN)
  listDoctorProfiles(@Query() query: ListDoctorSpecialtyProfilesQueryDto) {
    return this.listDoctorSpecialtyProfilesUseCase.execute(query);
  }

  @Put('admin/doctors/:userId')
  @Roles(UserRole.ADMIN)
  @MsgCode(MSG.INFO_0030)
  updateDoctorProfile(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateDoctorSpecialtyDto,
  ) {
    return this.updateDoctorSpecialtyProfileUseCase.execute(userId, user.sub, dto);
  }

  @Post('admin/doctors/:userId/approve')
  @Roles(UserRole.ADMIN)
  @MsgCode(MSG.INFO_0030)
  approveDoctorProfileUpdate(@Param('userId') userId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.approveDoctorSpecialtyUpdateUseCase.execute(userId, user.sub);
  }

  @Post('admin/doctors/:userId/reject')
  @Roles(UserRole.ADMIN)
  @MsgCode(MSG.INFO_0030)
  rejectDoctorProfileUpdate(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RejectDoctorSpecialtyUpdateDto,
  ) {
    return this.rejectDoctorSpecialtyUpdateUseCase.execute(userId, user.sub, dto);
  }

  @Get('me')
  @Roles(UserRole.DOCTOR)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.getMyDoctorSpecialtyUseCase.execute(user.sub);
  }

  @Put('me')
  @Roles(UserRole.DOCTOR)
  @MsgCode(MSG.INFO_0030)
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateDoctorSpecialtyDto) {
    return this.updateMyDoctorSpecialtyUseCase.execute(user.sub, dto);
  }
}
