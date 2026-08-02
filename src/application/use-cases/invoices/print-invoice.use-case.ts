import { Inject, Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../../errors/application-error';
import { INVOICE_REPOSITORY, InvoiceRepository } from '../../../domain/repositories/invoice.repository';
import { PATIENT_REPOSITORY, PatientRepository } from '../../../domain/repositories/patient.repository';
import { PdfService } from '../../../infrastructure/services/pdf.service';

@Injectable()
export class PrintInvoiceUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepository: InvoiceRepository,
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: PatientRepository,
    private readonly pdfService: PdfService,
  ) {}

  async execute(invoiceId: string): Promise<Buffer> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) throw new ResourceNotFoundError('Invoice', { id: invoiceId });

    const patient = await this.patientRepository.findById(invoice.patientId);

    return this.pdfService.generateInvoicePdf({
      invoiceCode: invoice.invoiceCode,
      patientName: patient?.fullName ?? '',
      patientCode: patient?.patientCode ?? '',
      createdAt: invoice.createdAt,
      items: invoice.items.map((item) => ({
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        amount: item.amount,
      })),
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      total: invoice.total,
      amountDue: invoice.amountDue,
      paymentStatus: invoice.paymentStatus,
      paymentMethod: invoice.paymentMethod,
    });
  }
}
