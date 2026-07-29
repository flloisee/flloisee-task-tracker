import { useState, useRef, useEffect } from 'react';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const getMonthDays = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
import styles from './DatePicker.module.css';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function DatePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [year, setYear] = useState(() => {
    if (value) return +value.slice(0, 4);
    const d = new Date(); return d.getFullYear();
  });
  const [month, setMonth] = useState(() => {
    if (value) return +value.slice(5, 7) - 1;
    const d = new Date(); return d.getMonth();
  });

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const days = getMonthDays(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayStr = today();
  const selectedStr = value;

  const cell = (day: number) => {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = d === todayStr;
    const isSelected = d === selectedStr;

    return (
      <button
        key={day}
        type="button"
        className={`${styles.day}${isToday ? ' ' + styles.today : ''}${isSelected ? ' ' + styles.sel : ''}`}
        onClick={() => { onChange(d); setOpen(false); }}
        onMouseDown={e => e.preventDefault()}
      >
        {day}
      </button>
    );
  };

  const blankCells = Array.from({ length: firstDay }, (_, i) => (
    <span key={`b${i}`} className={styles.blank} />
  ));

  const dayCells = Array.from({ length: days }, (_, i) => cell(i + 1));

  const display = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Due date';

  return (
    <div ref={ref} className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.trigger}${!value ? ' ' + styles.placeholder : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Due date"
        aria-expanded={open}
      >
        {display}
      </button>
      {open && (
        <div className={styles.popup}>
          <div className={styles.header}>
            <button type="button" className={styles.nav} onClick={() => {
              if (month === 0) { setYear(y => y - 1); setMonth(11); }
              else setMonth(m => m - 1);
            }} aria-label="Previous month">‹</button>
            <span className={styles.title}>{MONTHS[month]} {year}</span>
            <button type="button" className={styles.nav} onClick={() => {
              if (month === 11) { setYear(y => y + 1); setMonth(0); }
              else setMonth(m => m + 1);
            }} aria-label="Next month">›</button>
          </div>
          <div className={styles.grid}>
            {DAYS.map(d => <span key={d} className={styles.dayLabel}>{d}</span>)}
            {blankCells}
            {dayCells}
          </div>
        </div>
      )}
    </div>
  );
}
