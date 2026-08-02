import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreatePrescriptionDto } from '../../application/dtos/prescriptions/create-prescription.dto';
import { MSG } from '../../domain/value-objects/message-code.vo';
import { UserRole } from '../../domain/enums/user-role.enum';
import { CurrentUser } from '../decorators/current-user.decorator';
import { MsgCode } from '../decorators/msg-code.decorator';
import { Roles } from '../decorators/roles.decorator';
import { SkipAudit } from '../decorators/skip-audit.decorator';
import { AuthenticatedUser } from '../guards/authenticated-user.type';
import { CreatePrescriptionUseCase } from '../../application/use-cases/prescriptions/create-prescription.use-case';
import { GetPrescriptionUseCase } from '../../application/use-cases/prescriptions/get-prescription.use-case';
import { PdfService } from '../../infrastructure/services/pdf.service';

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(
    private readonly createPrescriptionUseCase: CreatePrescriptionUseCase,
    private readonly getPrescriptionUseCase: GetPrescriptionUseCase,
    private readonly pdfService: PdfService,
  ) {}

  // Feature 21 — Create prescription (INFO_0055)
  @Post()
  @Roles(UserRole.DOCTOR)
  @MsgCode(MSG.INFO_0055)
  @SkipAudit()
  create(@Body() dto: CreatePrescriptionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.createPrescriptionUseCase.execute({ ...dto, actorId: user.sub });
  }

  // Feature 21 — Get prescription by visitId
  @Get()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  getByVisit(@Query('visitId') visitId: string) {
    return this.getPrescriptionUseCase.getByVisitId(visitId);
  }

  // Feature 21 — Print prescription PDF (INFO_0057)
  @Get(':id/print')
  @Roles(UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.NURSE)
  async print(@Param('id') id: string, @Res() res: Response) {
    const data = await this.getPrescriptionUseCase.getById(id);
    const pdf = await this.pdfService.generatePrescriptionPdf(data);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="prescription-${id}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.send(pdf);
  }
}
