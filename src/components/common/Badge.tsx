import React from 'react';
import { BookingStatus, EquipmentCondition, EquipmentTransactionStatus, MaintenanceStatus, ResourceMaintenanceStatus } from '../../types';

interface BadgeProps {
  status:
    | BookingStatus
    | ResourceMaintenanceStatus
    | MaintenanceStatus
    | EquipmentTransactionStatus
    | EquipmentCondition
    | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '', size = 'md' }) => {
  const getBadgeStyle = (val: string) => {
    switch (val) {
      // Booking Statuses
      case 'APPROVED':
      case 'OPERATIONAL':
      case 'RESOLVED':
      case 'RETURNED':
      case 'EXCELLENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      case 'PENDING':
      case 'REQUESTED':
      case 'REPORTED':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      case 'IN_PROGRESS':
      case 'ISSUED':
      case 'GOOD':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      case 'UNDER_MAINTENANCE':
      case 'RESTRICTED':
      case 'FAIR':
        return 'bg-orange-50 text-orange-700 border-orange-200';

      case 'REJECTED':
      case 'CANCELLED':
      case 'OVERDUE':
      case 'DAMAGED_RETURN':
      case 'LOST':
      case 'DAMAGED':
      case 'POOR':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold shadow-sm uppercase tracking-wide ${sizeClasses} ${getBadgeStyle(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {formatText(status)}
    </span>
  );
};
