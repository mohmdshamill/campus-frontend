export type Role = 'SUPER_ADMIN' | 'WEBSITE_ADMIN' | 'COORDINATOR' | 'STUDENT';

export type ResourceType =
  | 'CLASSROOM'
  | 'COMPUTER_LAB'
  | 'SCIENCE_LAB'
  | 'SEMINAR_HALL'
  | 'AUDITORIUM'
  | 'MEETING_ROOM'
  | 'PROJECTOR'
  | 'EQUIPMENT';

export type ResourceMaintenanceStatus = 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'RESTRICTED';

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export type EquipmentCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';

export type EquipmentTransactionStatus =
  | 'REQUESTED'
  | 'ISSUED'
  | 'RETURNED'
  | 'OVERDUE'
  | 'DAMAGED_RETURN'
  | 'LOST'
  | 'REJECTED';

export type MaintenanceStatus = 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type NotificationType =
  | 'BOOKING_SUBMITTED'
  | 'BOOKING_APPROVED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_REMINDER'
  | 'EQUIPMENT_ISSUED'
  | 'EQUIPMENT_OVERDUE'
  | 'MAINTENANCE_ALERT'
  | 'SYSTEM';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  collegeId?: string | null;
  phone?: string | null;
  departmentId?: string | null;
  isActive: boolean;
  createdAt: string;
  department?: Department | null;
  memberships?: DepartmentMembership[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    resources: number;
    equipment: number;
    users: number;
  };
  members?: DepartmentMembership[];
}

export interface DepartmentMembership {
  id: string;
  userId: string;
  departmentId: string;
  roleInDept: string;
  isPrimary: boolean;
  department?: Department;
  user?: User;
}

export interface Resource {
  id: string;
  name: string;
  code: string;
  type: ResourceType;
  description?: string | null;
  departmentId: string;
  department?: Department;
  building: string;
  roomNumber: string;
  floor?: string | null;
  capacity: number;
  facilities?: string | null;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  minBookingMinutes: number;
  maxBookingMinutes: number;
  minAdvanceDays: number;
  maxAdvanceDays: number;
  requiresApproval: boolean;
  isActive: boolean;
  maintenanceStatus: ResourceMaintenanceStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookings: number;
    academicSchedules: number;
    maintenanceRecords: number;
  };
}

export interface Booking {
  id: string;
  bookingCode: string;
  resourceId: string;
  resource: Resource;
  userId: string;
  user: User;
  startDateTime: string;
  endDateTime: string;
  purpose: string;
  attendeesCount: number;
  specialRequirements?: string | null;
  status: BookingStatus;
  approvedById?: string | null;
  approvedBy?: User | null;
  rejectionReason?: string | null;
  cancellationReason?: string | null;
  isAutoApproved: boolean;
  createdAt: string;
  updatedAt: string;
  statusHistory?: BookingStatusHistory[];
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  fromStatus?: BookingStatus | null;
  toStatus: BookingStatus;
  changedById?: string | null;
  changedBy?: User | null;
  reason?: string | null;
  createdAt: string;
}

export interface AcademicSchedule {
  id: string;
  resourceId: string;
  resource?: Resource;
  departmentId: string;
  department?: Department;
  courseName: string;
  courseCode: string;
  instructorName: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  semester: string;
  academicYear: string;
  isActive: boolean;
}

export interface CollegeEvent {
  id: string;
  resourceId: string;
  resource?: Resource;
  title: string;
  description?: string | null;
  organizer: string;
  eventType: string;
  startDateTime: string;
  endDateTime: string;
  isCancelled: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  assetCode: string;
  category: string;
  departmentId: string;
  department?: Department;
  quantityOwned: number;
  quantityAvailable: number;
  condition: EquipmentCondition;
  location: string;
  description?: string | null;
  maintenanceStatus: string;
  purchaseDate?: string | null;
  isActive: boolean;
  _count?: {
    transactions: number;
  };
}

export interface EquipmentTransaction {
  id: string;
  equipmentId: string;
  equipment: Equipment;
  userId: string;
  user: User;
  issuedById?: string | null;
  issuedBy?: User | null;
  quantity: number;
  status: EquipmentTransactionStatus;
  requestDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string | null;
  purpose: string;
  notes?: string | null;
  conditionOnReturn?: EquipmentCondition | null;
}

export interface MaintenanceRecord {
  id: string;
  resourceId: string;
  resource: Resource;
  reportedById: string;
  reportedBy: User;
  resolvedById?: string | null;
  resolvedBy?: User | null;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  status: MaintenanceStatus;
  priority: Priority;
  resolutionNotes?: string | null;
  affectedBookings?: Booking[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  bookingId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  user?: User | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
  error?: any;
}
