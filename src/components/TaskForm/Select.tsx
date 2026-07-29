import { useState, useRef, useEffect } from 'react';
import styles from './Select.module.css';

interface Props<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
  label: string;
}

export function Select<T extends string>({ value, onChange, options, label }: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find(([v]) => v === value)?.[1] ?? value;

  return (
    <div ref={ref} className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-label={label}
        aria-expanded={open}
      >
        {selected}
        <span className={styles.arrow} aria-hidden>▾</span>
      </button>
      {open && (
        <ul className={styles.menu} role="listbox" aria-label={label}>
          {options.map(([v, label]) => (
            <li
              key={v}
              role="option"
              aria-selected={v === value}
              className={`${styles.opt}${v === value ? ' ' + styles.sel : ''}`}
              onClick={() => { onChange(v); setOpen(false); }}
              onMouseDown={e => e.preventDefault()}
            >
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
