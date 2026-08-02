import { readFile } from 'fs/promises';
import { join } from 'path';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { CreateClsOrderDto } from '../../application/dtos/cls-orders/create-cls-order.dto';
import { EditClsOrderDto } from '../../application/dtos/cls-orders/edit-cls-order.dto';
import { EnterClsResultDto } from '../../application/dtos/cls-orders/enter-cls-result.dto';
import { MSG } from '../../domain/value-objects/message-code.vo';
import { UserRole } from '../../domain/enums/user-role.enum';
import { ClsOrderStatus } from '../../domain/enums/cls-order-status.enum';
import { CurrentUser } from '../decorators/current-user.decorator';
import { MsgCode } from '../decorators/msg-code.decorator';
import { Roles } from '../decorators/roles.decorator';
import { SkipAudit } from '../decorators/skip-audit.decorator';
import { AuthenticatedUser } from '../guards/authenticated-user.type';
import { RequestWithTrace } from '../interceptors/request-id.interceptor';
import { ApiResponse } from '../response/api-response';
import {
  DEFAULT_LOCALE,
  MESSAGE_CATALOG_PORT,
  MessageCatalogPort,
} from '../../application/ports/message-catalog.port';
import { CreateClsOrderUseCase } from '../../application/use-cases/cls-orders/create-cls-order.use-case';
import { EditClsOrderUseCase } from '../../application/use-cases/cls-orders/edit-cls-order.use-case';
import { ListClsOrdersUseCase } from '../../application/use-cases/cls-orders/list-cls-orders.use-case';
import { ListAllClsOrdersUseCase } from '../../application/use-cases/cls-orders/list-all-cls-orders.use-case';
import { CallPatientToClsUseCase } from '../../application/use-cases/cls-orders/call-patient-to-cls.use-case';
import { EnterClsResultUseCase } from '../../application/use-cases/cls-orders/enter-cls-result.use-case';
import { CLS_ORDER_REPOSITORY, ClsOrderRepository } from '../../domain/repositories/cls-order.repository';
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository';
import { toClsOrderResponse } from '../../application/dtos/cls-orders/cls-order-response.dto';
import { PdfService } from '../../infrastructure/services/pdf.service';
import { STORAGE_PORT, StoragePort } from '../../application/ports/storage.port';

@Controller('cls-orders')
export class ClsOrdersController {
  constructor(
    private readonly createClsOrderUseCase: CreateClsOrderUseCase,
    private readonly editClsOrderUseCase: EditClsOrderUseCase,
    private readonly listClsOrdersUseCase: ListClsOrdersUseCase,
    private readonly listAllClsOrdersUseCase: ListAllClsOrdersUseCase,
    private readonly callPatientToClsUseCase: CallPatientToClsUseCase,
    private readonly enterClsResultUseCase: EnterClsResultUseCase,
    @Inject(CLS_ORDER_REPOSITORY) private readonly clsOrderRepository: ClsOrderRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly pdfService: PdfService,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
    @Inject(MESSAGE_CATALOG_PORT) private readonly messageCatalog: MessageCatalogPort,
  ) {}

  // Feature 17 — Create CLS order (INFO_0047)
  @Post()
  @Roles(UserRole.DOCTOR)
  @MsgCode(MSG.INFO_0047)
  @SkipAudit()
  create(@Body() dto: CreateClsOrderDto, @CurrentUser() user: AuthenticatedUser) {
    return this.createClsOrderUseCase.execute({ ...dto, actorId: user.sub });
  }

  // List CLS orders: by visitId (doctor) or today's queue for KTV (lab tech)
  @Get()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.LAB_TECH)
  list(
    @Query('visitId') visitId?: string,
    @Query('statuses') statuses?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    if (visitId) {
      return this.listClsOrdersUseCase.execute(visitId);
    }
    const statusFilter = statuses
      ? (statuses.split(',') as ClsOrderStatus[])
      : undefined;
    return this.listAllClsOrdersUseCase.execute(user!.sub, statusFilter);
  }

  // Get single CLS order by ID (for result entry page)
  @Get(':id')
  @Roles(UserRole.LAB_TECH, UserRole.DOCTOR, UserRole.NURSE)
  async getById(@Param('id') id: string) {
    const item = await this.clsOrderRepository.findWithDetailById(id);
    if (!item) throw new NotFoundException('Không tìm thấy phiếu CLS');
    return toClsOrderResponse(
      item.order,
      item.serviceName,
      item.clsRoomName,
      item.patientName,
      item.patientCode,
      item.dateOfBirth,
      item.gender,
      item.doctorName,
      item.appointmentTime,
      item.resultSummary,
      item.resultAttachments,
      item.resultRows,
      item.clsRoomCategory,
      item.resultFindings,
    );
  }

  // Edit CLS order — only while PENDING (INFO_0088)
  @Patch(':id')
  @Roles(UserRole.DOCTOR)
  @MsgCode(MSG.INFO_0088)
  @SkipAudit()
  edit(@Param('id') id: string, @Body() dto: EditClsOrderDto, @CurrentUser() user: AuthenticatedUser) {
    return this.editClsOrderUseCase.execute(id, dto, user.sub);
  }

  // Feature 18 — Call patient into CLS room (INFO_0048, has {room_code} placeholder)
  @Patch(':id/call')
  @Roles(UserRole.LAB_TECH)
  @SkipAudit()
  async callPatient(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: RequestWithTrace) {
    const result = await this.callPatientToClsUseCase.execute(id, user.sub);
    const message = this.messageCatalog.getMessage(MSG.INFO_0048, DEFAULT_LOCALE, {
      room_code: result.clsRoomName,
    });
    return ApiResponse.ok(result, message, { traceId: req.traceId });
  }

  // Feature 19 — Enter CLS result (INFO_0049)
  @Patch(':id/result')
  @Roles(UserRole.LAB_TECH)
  @MsgCode(MSG.INFO_0049)
  @SkipAudit()
  enterResult(
    @Param('id') id: string,
    @Body() dto: EnterClsResultDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.enterClsResultUseCase.execute(id, dto.summary, user.sub, dto.rows, dto.findings);
  }

  // Feature 17 — Print CLS order PDF (routing slip for patient)
  @Get(':id/print')
  @Roles(UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.NURSE)
  async printClsOrder(@Param('id') id: string, @Res() res: Response) {
    const item = await this.clsOrderRepository.findWithDetailById(id);
    if (!item) {
      res.status(404).json({ message: 'CLS Order not found' });
      return;
    }
    const pdf = await this.pdfService.generateClsOrderPdf({
      clsOrderId: item.order.id,
      patientName: item.patientName,
      patientCode: item.patientCode,
      dateOfBirth: item.dateOfBirth,
      gender: item.gender,
      doctorName: item.doctorName,
      serviceName: item.serviceName,
      clsRoomName: item.clsRoomName,
      note: item.order.note,
      createdAt: item.order.createdAt,
    });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="cls-order-${id}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.send(pdf);
  }

  // Print CLS result PDF (result slip KTV gives to patient)
  @Get(':id/result-print')
  @Roles(UserRole.LAB_TECH, UserRole.DOCTOR, UserRole.RECEPTIONIST)
  async printClsResult(@Param('id') id: string, @Res() res: Response) {
    const item = await this.clsOrderRepository.findWithDetailById(id);
    if (!item) {
      res.status(404).json({ message: 'CLS Order not found' });
      return;
    }
    if (!item.resultSummary) {
      res.status(400).json({ message: 'Chưa có kết quả CLS để in' });
      return;
    }

    // Read image buffers from local disk; skip files that can't be read or aren't images
    const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png']);
    const attachments = await Promise.all(
      item.resultAttachments.map(async (a) => {
        const ext = a.fileName.split('.').pop()?.toLowerCase() ?? '';
        if (!IMAGE_EXTS.has(ext)) return { fileName: a.fileName };
        try {
          // fileUrl is a relative path like /uploads/cls-attachments/uuid.jpg
          const diskPath = join(process.cwd(), a.fileUrl);
          const buffer = await readFile(diskPath);
          return { fileName: a.fileName, buffer };
        } catch {
          return { fileName: a.fileName };
        }
      }),
    );

    const enteredByUser = item.resultEnteredBy ? await this.userRepository.findById(item.resultEnteredBy) : null;

    const pdf = await this.pdfService.generateClsResultPdf({
      clsOrderId: item.order.id,
      patientName: item.patientName,
      patientCode: item.patientCode,
      dateOfBirth: item.dateOfBirth,
      gender: item.gender,
      doctorName: item.doctorName,
      serviceName: item.serviceName,
      clsRoomName: item.clsRoomName,
      clsRoomCategory: item.clsRoomCategory,
      summary: item.resultSummary,
      resultRows: item.resultRows,
      findings: item.resultFindings,
      completedAt: item.order.createdAt,
      attachments,
      enteredByName: enteredByUser?.fullName ?? null,
    });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="cls-result-${id}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.send(pdf);
  }

  // Upload attachment for a CLS result (INFO_0051)
  @Post(':id/attachments')
  @Roles(UserRole.LAB_TECH)
  @MsgCode(MSG.INFO_0051)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowed.includes(file.mimetype)) {
          cb(new BadRequestException('Chỉ chấp nhận ảnh JPG, PNG hoặc PDF.'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('Không có tệp nào được tải lên.');

    const item = await this.clsOrderRepository.findWithDetailById(id);
    if (!item) throw new NotFoundException('Không tìm thấy phiếu CLS');
    if (item.order.status !== ClsOrderStatus.COMPLETED) {
      throw new BadRequestException('Chỉ có thể đính kèm tệp sau khi đã lưu kết quả.');
    }

    const uploaded = await this.storage.upload({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder: 'cls-attachments',
    });

    const ext = file.originalname.split('.').pop()?.toUpperCase() ?? '';
    const fileType =
      ext === 'PDF' ? 'PDF' :
      ext === 'PNG' ? 'PNG' :
      'JPG';

    await this.clsOrderRepository.addAttachment(id, {
      fileName: file.originalname,
      fileUrl: uploaded.url,
      fileType: fileType as 'PDF' | 'JPG' | 'PNG',
      fileSizeKb: Math.ceil(file.size / 1024),
      uploadedBy: user.sub,
    });

    return { url: uploaded.url, fileName: file.originalname };
  }
}
