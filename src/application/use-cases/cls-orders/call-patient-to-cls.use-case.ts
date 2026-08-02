import { Inject, Injectable } from '@nestjs/common';
import { ClsOrderResponseDto, toClsOrderResponse } from '../../dtos/cls-orders/cls-order-response.dto';
import {
  ClsOrderNotFoundError,
  ClsOrderNotPendingError,
  ClsRoomBusyError,
} from '../../errors/application-error';
import { AUDIT_LOG_PORT, AuditLogPort } from '../../ports/audit-log.port';
import { REALTIME_PORT, RealtimePort } from '../../ports/realtime.port';
import { ClsOrderStatus } from '../../../domain/enums/cls-order-status.enum';
import { CLS_ORDER_REPOSITORY, ClsOrderRepository } from '../../../domain/repositories/cls-order.repository';

@Injectable()
export class CallPatientToClsUseCase {
  constructor(
    @Inject(CLS_ORDER_REPOSITORY) private readonly clsOrderRepository: ClsOrderRepository,
    @Inject(AUDIT_LOG_PORT) private readonly auditLog: AuditLogPort,
    @Inject(REALTIME_PORT) private readonly realtimePort: RealtimePort,
  ) {}

  async execute(clsOrderId: string, actorId: string): Promise<ClsOrderResponseDto> {
    const item = await this.clsOrderRepository.findWithDetailById(clsOrderId);
    if (!item) throw new ClsOrderNotFoundError();
    if (item.order.status !== ClsOrderStatus.PENDING) throw new ClsOrderNotPendingError();

    // Business Rule: only 1 patient (visitId) IN_PROGRESS per CLS room at a time.
    // Multiple orders from the same patient/visit can be IN_PROGRESS simultaneously.
    const inProgressCount = await this.clsOrderRepository.countInProgressByRoomExcludingVisit(
      item.order.clsRoomId,
      item.order.visitId,
    );
    if (inProgressCount > 0) throw new ClsRoomBusyError();

    const calledAt = new Date();
    const updated = await this.clsOrderRepository.updateStatus(clsOrderId, ClsOrderStatus.IN_PROGRESS, calledAt);

    await this.auditLog.write({
      userId: actorId,
      action: 'CALL_PATIENT_TO_CLS',
      module: 'VISIT',
      targetId: clsOrderId,
    });

    try {
      this.realtimePort.emit('LAB_TECH', 'cls-order:changed', { clsOrderId: updated.id });
    } catch {
      // Realtime notification is best-effort — never let it fail the write.
    }

    return toClsOrderResponse(
      updated,
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
}
