import { Inject, Injectable } from '@nestjs/common';
import { ListInvoicesQueryDto } from '../../dtos/invoices/list-invoices-query.dto';
import { InvoiceListResponseDto } from '../../dtos/invoices/invoice-response.dto';
import { buildPaginationMeta } from '../../dtos/pagination.dto';
import {
  INVOICE_REPOSITORY,
  InvoiceRepository,
} from '../../../domain/repositories/invoice.repository';

@Injectable()
export class ListInvoicesUseCase {
  constructor(@Inject(INVOICE_REPOSITORY) private readonly invoiceRepository: InvoiceRepository) {}

  async execute(query: ListInvoicesQueryDto): Promise<InvoiceListResponseDto> {
    const { items, total } = await this.invoiceRepository.findMany({
      search: query.search,
      paymentStatus: query.paymentStatus,
      page: query.page,
      limit: query.limit,
    });

    return {
      items: items.map(({ invoice, patientName, patientCode }) => ({
        id: invoice.id,
        appointmentId: invoice.appointmentId,
        patientId: invoice.patientId,
        patientName,
        patientCode,
        invoiceCode: invoice.invoiceCode,
        subtotal: invoice.subtotal,
        discount: invoice.discount,
        total: invoice.total,
        amountDue: invoice.amountDue,
        paymentStatus: invoice.paymentStatus,
        paymentMethod: invoice.paymentMethod,
        paidAt: invoice.paidAt,
        note: invoice.note,
        createdAt: invoice.createdAt,
        items: invoice.items.map((item) => ({
          id: item.id,
          itemType: item.itemType,
          name: item.name,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          amount: item.amount,
        })),
      })),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }
}
