import { Invoice } from '../entities/invoice.entity';
import { InvoiceItemType } from '../enums/invoice-item-type.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export const INVOICE_REPOSITORY = Symbol('INVOICE_REPOSITORY');

export interface CreateInvoiceItemData {
  itemType: InvoiceItemType;
  serviceRefId?: string | null;
  clsRefId?: string | null;
  medicineRefId?: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
  amount: number;
}

export interface CreateInvoiceData {
  appointmentId: string;
  patientId: string;
  invoiceCode: string;
  subtotal: number;
  discount: number;
  total: number;
  amountDue: number;
  note?: string | null;
  createdBy: string;
  items: CreateInvoiceItemData[];
}

export interface InvoiceListFilter {
  search?: string;
  paymentStatus?: PaymentStatus;
  page: number;
  limit: number;
}

export interface InvoiceListItem {
  invoice: Invoice;
  patientName: string;
  patientCode: string;
}

export interface InvoiceRepository {
  findById(id: string): Promise<Invoice | null>;
  findByAppointmentId(appointmentId: string): Promise<Invoice | null>;
  findMany(filter: InvoiceListFilter): Promise<{ items: InvoiceListItem[]; total: number }>;
  create(data: CreateInvoiceData): Promise<Invoice>;
  updatePayment(id: string, paymentStatus: PaymentStatus, paymentMethod: PaymentMethod, paidAt: Date): Promise<Invoice>;
}
