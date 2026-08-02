import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum';

export class PayInvoiceRequestDto {
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}
