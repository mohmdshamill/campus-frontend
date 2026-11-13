import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm animate-pulse space-y-4"
        >
          <div className="flex justify-between items-start">
            <div className="h-5 bg-slate-200 rounded w-2/3"></div>
            <div className="h-5 bg-slate-200 rounded-full w-16"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3.5 bg-slate-100 rounded w-full"></div>
            <div className="h-3.5 bg-slate-100 rounded w-4/5"></div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-8 bg-slate-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm animate-pulse">
      <div className="h-12 bg-slate-100 border-b border-slate-200 flex items-center px-6 gap-6">
        <div className="h-4 bg-slate-300 rounded w-1/4"></div>
        <div className="h-4 bg-slate-300 rounded w-1/4"></div>
        <div className="h-4 bg-slate-300 rounded w-1/4"></div>
        <div className="h-4 bg-slate-300 rounded w-1/4"></div>
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="h-16 flex items-center px-6 gap-6">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
