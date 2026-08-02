import { InvoiceItemType } from '../enums/invoice-item-type.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export class InvoiceItem {
  constructor(
    public readonly id: string,
    public readonly invoiceId: string,
    public readonly itemType: InvoiceItemType,
    public readonly serviceRefId: string | null,
    public readonly clsRefId: string | null,
    public readonly medicineRefId: string | null,
    public readonly name: string,
    public readonly unitPrice: number,
    public readonly quantity: number,
    public readonly amount: number,
  ) {}
}

export class Invoice {
  constructor(
    public readonly id: string,
    public readonly appointmentId: string,
    public readonly patientId: string,
    public readonly invoiceCode: string,
    public readonly subtotal: number,
    public readonly discount: number,
    public readonly total: number,
    public readonly amountDue: number,
    public readonly paymentStatus: PaymentStatus,
    public readonly paymentMethod: PaymentMethod | null,
    public readonly paidAt: Date | null,
    public readonly note: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: string,
    public readonly items: InvoiceItem[],
  ) {}
}
