import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * Password input with a show/hide toggle. Render it inside a `relative` wrapper
 * (the auth pages already do); works with react-hook-form's register().
 */
export const PasswordInput = forwardRef<HTMLInputElement, Props>(({ className = '', ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <input
        {...props}
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={className.replace('pr-3.5', 'pr-10')}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </>
  );
});
PasswordInput.displayName = 'PasswordInput';
