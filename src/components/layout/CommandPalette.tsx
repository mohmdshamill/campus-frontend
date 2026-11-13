import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft, Layers, LayoutDashboard, CalendarCheck2, Package, Wrench, CalendarDays, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resourcesApi } from '../../api/resources';

interface Item {
  id: string;
  label: string;
  hint: string;
  to: string;
  icon: React.ElementType;
}

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isCoordinator } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [resources, setResources] = useState<Item[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const home = isSuperAdmin ? '/admin/dashboard' : isCoordinator ? '/coordinator/dashboard' : '/student/dashboard';
  const pages: Item[] = useMemo(
    () => [
      { id: 'p-home', label: 'Dashboard', hint: 'Page', to: home, icon: LayoutDashboard },
      { id: 'p-res', label: 'Browse resources', hint: 'Page', to: '/resources', icon: Layers },
      { id: 'p-book', label: 'Bookings', hint: 'Page', to: '/bookings', icon: CalendarCheck2 },
      { id: 'p-sched', label: 'Academic timetable', hint: 'Page', to: '/schedules', icon: CalendarDays },
      { id: 'p-events', label: 'College events', hint: 'Page', to: '/events', icon: CalendarDays },
      { id: 'p-eq', label: 'Equipment', hint: 'Page', to: '/equipment', icon: Package },
      { id: 'p-maint', label: 'Maintenance', hint: 'Page', to: '/maintenance', icon: Wrench },
      { id: 'p-notif', label: 'Notifications', hint: 'Page', to: '/notifications', icon: Bell },
    ],
    [home]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Debounced facility search
  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResources([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await resourcesApi.list({ search: query.trim(), limit: 6 });
        setResources(
          (res.data || []).map((r: any) => ({
            id: r.id,
            label: r.name,
            hint: String(r.type).replace(/_/g, ' '),
            to: `/resources/${r.id}`,
            icon: Layers,
          }))
        );
      } catch {
        setResources([]);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query, open]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filteredPages = q ? pages.filter((p) => p.label.toLowerCase().includes(q)) : pages;
    return [...resources, ...filteredPages];
  }, [query, pages, resources]);

  const go = (item?: Item) => {
    if (!item) return;
    setOpen(false);
    navigate(item.to);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      go(items[active]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl glass rounded-2xl shadow-2xl overflow-hidden animate-pop-in">
        <div className="flex items-center gap-3 px-4 border-b border-slate-200/70">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Search facilities or jump to a page…"
            className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-slate-400"
          />
          <kbd className="text-[10px] text-slate-500 border border-slate-300 rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-slate-500">No matches</li>}
          {items.map((item, i) => (
            <li key={item.id}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                  i === active ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 truncate font-medium">{item.label}</span>
                <span className={`text-[11px] uppercase tracking-wide ${i === active ? 'text-white/80' : 'text-slate-400'}`}>{item.hint}</span>
                {i === active && <CornerDownLeft className="w-3.5 h-3.5" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
