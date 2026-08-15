export type UserRole = 'ADMIN' | 'STAFF' | 'STUDENT';

export type IDStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED' | 'EXPIRED';

export type FineStatus = 'PENDING' | 'PAID' | 'WAIVED' | 'CANCELLED';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  avatarUrl?: string;
  departmentId?: string;
}

export interface Student {
  id: string;
  registerNumber: string;
  studentIdNumber: string;
  name: string;
  photoUrl: string;
  departmentId: string;
  departmentName: string;
  course: string;
  year: number;
  collegeEmail: string;
  phoneNumber: string;
  status: IDStatus;
  validUntil: string;
  issuedAt: string;
  qrSecureToken: string;
  address?: string;
  guardianPhone?: string;
  bloodGroup?: string;
}

export interface IDCard {
  id: string;
  studentId: string;
  secureToken: string;
  issuedAt: string;
  expiresAt: string;
  status: IDStatus;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hodName: string;
  hodEmail: string;
  hodPhone: string;
  hodPhotoUrl: string;
  studentCount: number;
}

export interface Fine {
  id: string;
  fineNumber: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  amount: number;
  reason: string;
  dueDate: string;
  status: FineStatus;
  createdAt: string;
  paidAt?: string;
  paymentRef?: string;
}

export interface Payment {
  id: string;
  fineId: string;
  studentId: string;
  studentName: string;
  amount: number;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  paymentMethod: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  createdAt: string;
  paidAt: string;
}

export type ScanResultType = 'SUCCESS' | 'DENIED' | 'LATE' | 'EXPIRED' | 'SUSPENDED' | 'BANNED' | 'INVALID_TOKEN' | 'INACTIVE';

export interface VerificationLog {
  id: string;
  studentId: string;
  registerNumber: string;
  studentName: string;
  departmentName: string;
  photoUrl: string;
  capturedThumbnailUrl?: string;
  verifiedBy: string;
  verifierName: string;
  result: IDStatus | 'INVALID_TOKEN' | 'LATE' | 'SUCCESS' | 'DENIED' | string;
  scanStatus?: ScanResultType;
  scanEvent?: string;
  location: string;
  timestamp: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'STUDENT' | 'ID_CARD' | 'FINE' | 'PAYMENT' | 'DEPARTMENT' | 'SYSTEM';
  entityId: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  ipAddress: string;
  createdAt: string;
}

export interface HodVpPost {
  id: string;
  authorName: string;
  authorRole: 'VICE_PRINCIPAL' | 'HOD' | 'DEAN' | 'STAFF_HEAD';
  department?: string;
  authorPhotoUrl: string;
  title: string;
  content: string;
  photoUrl?: string;
  attachmentName?: string;
  isConfidential: boolean; // HOD and staff only
  likesCount: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
