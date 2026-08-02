import { Inject, Injectable } from '@nestjs/common';
import { PayInvoiceRequestDto } from '../../dtos/invoices/pay-invoice.dto';
import { InvoiceResponseDto, toInvoiceResponse } from '../../dtos/invoices/invoice-response.dto';
import { InvoiceAlreadyPaidError, ResourceNotFoundError } from '../../errors/application-error';
import { AUDIT_LOG_PORT, AuditLogPort } from '../../ports/audit-log.port';
import { REALTIME_PORT, RealtimePort } from '../../ports/realtime.port';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import {
  INVOICE_REPOSITORY,
  InvoiceRepository,
} from '../../../domain/repositories/invoice.repository';
import { PATIENT_REPOSITORY, PatientRepository } from '../../../domain/repositories/patient.repository';

export interface PayInvoiceInput extends PayInvoiceRequestDto {
  invoiceId: string;
  actorId: string;
}

@Injectable()
export class PayInvoiceUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepository: InvoiceRepository,
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: PatientRepository,
    @Inject(AUDIT_LOG_PORT) private readonly auditLog: AuditLogPort,
    @Inject(REALTIME_PORT) private readonly realtimePort: RealtimePort,
  ) {}

  async execute(input: PayInvoiceInput): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceRepository.findById(input.invoiceId);
    if (!invoice) throw new ResourceNotFoundError('Invoice', { id: input.invoiceId });

    // Business Rule: an invoice already marked PAID cannot be paid again.
    if (invoice.paymentStatus === PaymentStatus.PAID) throw new InvoiceAlreadyPaidError();

    const paidAt = new Date();
    const updated = await this.invoiceRepository.updatePayment(
      invoice.id,
      PaymentStatus.PAID,
      input.paymentMethod,
      paidAt,
    );

    await this.auditLog.write({
      userId: input.actorId,
      action: 'INVOICE_PAID',
      module: 'INVOICE',
      targetId: updated.id,
      detail: { invoiceCode: updated.invoiceCode, amountDue: updated.amountDue, paymentMethod: input.paymentMethod },
    });

    try {
      this.realtimePort.emit(['RECEPTIONIST', 'ADMIN'], 'invoice:changed', { invoiceId: updated.id });
    } catch {
      // Realtime notification is best-effort — never let it fail the write.
    }

    const patient = await this.patientRepository.findById(updated.patientId);
    return toInvoiceResponse(updated, patient?.fullName ?? '', patient?.patientCode ?? '');
  }
}
