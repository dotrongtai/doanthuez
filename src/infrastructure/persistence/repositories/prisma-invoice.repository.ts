import { Injectable } from '@nestjs/common';
import { Invoice as PrismaInvoice, InvoiceItem as PrismaInvoiceItem, Prisma } from '@prisma/client';
import { Invoice, InvoiceItem } from '../../../domain/entities/invoice.entity';
import { InvoiceItemType } from '../../../domain/enums/invoice-item-type.enum';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import {
  CreateInvoiceData,
  InvoiceListFilter,
  InvoiceListItem,
  InvoiceRepository,
} from '../../../domain/repositories/invoice.repository';
import { PrismaService } from '../prisma/prisma.service';

type InvoiceRow = PrismaInvoice & { items: PrismaInvoiceItem[] };

@Injectable()
export class PrismaInvoiceRepository implements InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Invoice | null> {
    const row = await this.prisma.invoice.findUnique({ where: { id }, include: { items: true } });
    return row ? this.toDomain(row) : null;
  }

  async findByAppointmentId(appointmentId: string): Promise<Invoice | null> {
    const row = await this.prisma.invoice.findUnique({ where: { appointmentId }, include: { items: true } });
    return row ? this.toDomain(row) : null;
  }

  async findMany(filter: InvoiceListFilter): Promise<{ items: InvoiceListItem[]; total: number }> {
    const search = filter.search?.trim();

    const where: Prisma.InvoiceWhereInput = {
      ...(filter.paymentStatus ? { paymentStatus: filter.paymentStatus } : {}),
      ...(search
        ? {
            OR: [{ patient: { phone: { contains: search } } }, { patient: { idCard: { contains: search } } }],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        include: { items: true, patient: true },
        orderBy: { createdAt: 'desc' },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    const items: InvoiceListItem[] = rows.map((row) => ({
      invoice: this.toDomain(row),
      patientName: row.patient.fullName,
      patientCode: row.patient.patientCode,
    }));

    return { items, total };
  }

  async create(data: CreateInvoiceData): Promise<Invoice> {
    const row = await this.prisma.invoice.create({
      data: {
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        invoiceCode: data.invoiceCode,
        subtotal: data.subtotal,
        discount: data.discount,
        total: data.total,
        amountDue: data.amountDue,
        note: data.note ?? null,
        createdBy: data.createdBy,
        items: {
          create: data.items.map((item) => ({
            itemType: item.itemType,
            serviceRefId: item.serviceRefId ?? null,
            clsRefId: item.clsRefId ?? null,
            medicineRefId: item.medicineRefId ?? null,
            name: item.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            amount: item.amount,
          })),
        },
      },
      include: { items: true },
    });
    return this.toDomain(row);
  }

  async updatePayment(
    id: string,
    paymentStatus: PaymentStatus,
    paymentMethod: PaymentMethod,
    paidAt: Date,
  ): Promise<Invoice> {
    const row = await this.prisma.invoice.update({
      where: { id },
      data: { paymentStatus, paymentMethod, paidAt },
      include: { items: true },
    });
    return this.toDomain(row);
  }

  private toDomain(row: InvoiceRow): Invoice {
    return new Invoice(
      row.id,
      row.appointmentId,
      row.patientId,
      row.invoiceCode,
      Number(row.subtotal),
      Number(row.discount),
      Number(row.total),
      Number(row.amountDue),
      row.paymentStatus as PaymentStatus,
      row.paymentMethod as PaymentMethod | null,
      row.paidAt,
      row.note,
      row.createdAt,
      row.updatedAt,
      row.createdBy,
      row.items.map(
        (item) =>
          new InvoiceItem(
            item.id,
            item.invoiceId,
            item.itemType as InvoiceItemType,
            item.serviceRefId,
            item.clsRefId,
            item.medicineRefId,
            item.name,
            Number(item.unitPrice),
            item.quantity,
            Number(item.amount),
          ),
      ),
    );
  }
}
