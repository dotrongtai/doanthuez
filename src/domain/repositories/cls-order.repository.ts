import { ClsOrder } from '../entities/cls-order.entity';
import { ClsOrderStatus } from '../enums/cls-order-status.enum';
import { ClsRoomCategory } from '../enums/cls-room-category.enum';

export const CLS_ORDER_REPOSITORY = Symbol('CLS_ORDER_REPOSITORY');

export interface CreateClsOrderData {
  visitId: string;
  clsRoomId: string;
  serviceId: string;
  note?: string | null;
  createdBy: string;
}

export interface ClsResultAttachment {
  fileName: string;
  fileUrl: string;
}

// One row of a structured lab-test result (Feature: LAB-category CLS rooms
// only — X-quang/Siêu âm keep using free-text `summary`). Stored in
// cls_results.result_data as `{ rows: LabResultRow[] }`.
export interface LabResultRow {
  name: string;
  result: string;
  unit?: string;
  normalRange?: string;
  note?: string;
}

export interface ClsOrderListItem {
  order: ClsOrder;
  serviceName: string;
  clsRoomName: string;
  clsRoomCategory: ClsRoomCategory | null;
  patientName: string;
  patientCode: string;
  dateOfBirth: Date | null;
  gender: string;
  doctorName: string;
  appointmentTime: Date;
  resultSummary: string | null;
  resultAttachments: ClsResultAttachment[];
  resultRows: LabResultRow[] | null;
  // Descriptive findings text — only meaningful for XRAY/ULTRASOUND (the
  // "KẾT QUẢ" section on the real sample slips, distinct from the "KL"
  // conclusion stored in `resultSummary`). Null for LAB, which uses
  // `resultRows` instead.
  resultFindings: string | null;
  // User id who last entered/edited the result (cls_results.updated_by, or
  // created_by if never edited) — resolved to a display name only where
  // needed (print), not on every list/get call.
  resultEnteredBy: string | null;
}

export interface ListClsOrdersFilter {
  date?: string;
  statuses?: ClsOrderStatus[];
  clsRoomId?: string;
}

export interface UpdateClsOrderData {
  clsRoomId?: string;
  serviceId?: string;
  note?: string | null;
}

export interface UpdateClsOrderData {
  clsRoomId?: string;
  serviceId?: string;
  note?: string | null;
}

export interface ClsOrderRepository {
  findById(id: string): Promise<ClsOrder | null>;
  findWithDetailById(id: string): Promise<ClsOrderListItem | null>;
  findByVisitId(visitId: string): Promise<ClsOrderListItem[]>;
  findAll(filter: ListClsOrdersFilter): Promise<ClsOrderListItem[]>;
  countInProgressByRoom(clsRoomId: string): Promise<number>;
  countInProgressByRoomExcludingVisit(clsRoomId: string, excludeVisitId: string): Promise<number>;
  create(data: CreateClsOrderData): Promise<ClsOrder>;
  update(id: string, data: UpdateClsOrderData): Promise<ClsOrder>;
  updateStatus(id: string, status: ClsOrderStatus, calledAt?: Date): Promise<ClsOrder>;
  enterResult(id: string, summary: string, actorId: string, rows?: LabResultRow[], findings?: string): Promise<ClsOrder>;
  addAttachment(clsOrderId: string, data: {
    fileName: string;
    fileUrl: string;
    fileType: 'PDF' | 'JPG' | 'PNG' | 'DICOM';
    fileSizeKb?: number;
    uploadedBy: string;
  }): Promise<void>;
}
