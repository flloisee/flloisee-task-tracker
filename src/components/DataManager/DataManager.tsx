import { useState, useRef, useCallback, useEffect } from 'react';
import { exportTasksAsJson, importTasksFromJson, isFileConnected } from '../../services/storageService';
import styles from './DataManager.module.css';

interface Props {
  onImportComplete: () => void;
  onDisconnect: () => void;
  onReconnect: () => void;
}

export function DataManager({ onImportComplete, onReconnect }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'ok' | 'error' | 'info' } | null>(null);
  const [connected, setConnected] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check connection state on mount and after the panel opens
  const checkConnection = useCallback(async () => {
    setConnected(await isFileConnected());
  }, []);

  useEffect(() => { checkConnection(); }, [checkConnection]);

  /* ponytail: mousedown on wrapper detects outside clicks; Escape closes */
  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    // delay listener attachment so the trigger click doesn't immediately close
    const id = setTimeout(() => {
      document.addEventListener('mousedown', handler);
      document.addEventListener('keydown', onKey);
    }, 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleExport = useCallback(async () => {
    try {
      await exportTasksAsJson();
      setMessage({ text: 'Exported!', type: 'ok' });
    } catch {
      setMessage({ text: 'Export failed.', type: 'error' });
    }
    setTimeout(() => setMessage(null), 2000);
  }, []);

  const handleImportClick = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const count = await importTasksFromJson(text);
        onImportComplete();
        setMessage({ text: `Imported ${count} tasks!`, type: 'ok' });
      } catch (err) {
        setMessage({
          text: err instanceof Error ? err.message : 'Import failed.',
          type: 'error',
        });
      }
      e.target.value = '';
      setTimeout(() => setMessage(null), 3000);
    },
    [onImportComplete]
  );

  const handleToggleConnection = useCallback(async () => {
    try {
      await onReconnect();
      setConnected(true);
      setMessage({ text: 'Connected to data/tasks.json!', type: 'ok' });
    } catch {
      setMessage({ text: 'Connection cancelled.', type: 'error' });
    }
    setTimeout(() => setMessage(null), 3000);
  }, [onReconnect]);

  return (
      <div className={styles.wrapper} ref={wrapperRef}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(o => { if (!o) checkConnection(); return !o; })}
        aria-label="Data options"
        title={connected ? 'Connected to data/tasks.json' : 'Using local storage'}
        data-action="open-data-manager"
      >
        {connected ? '💾' : '💿'}
      </button>

      {open && (
        <div className={styles.panel} role="menu">
          <div className={styles.statusRow}>
            <span className={connected ? styles.connected : styles.disconnected}>
              {connected ? '● Connected — writes to data/tasks.json' : '○ Using local storage — file not synced'}
            </span>
          </div>

          <button className={styles.action} onClick={handleToggleConnection} role="menuitem">
            {connected ? '📁 Change data folder' : '📁 Connect to data folder'}
          </button>

          <hr className={styles.divider} />

          <button className={styles.action} onClick={handleExport} role="menuitem">
            ↓ Export as JSON
          </button>
          <button className={styles.action} onClick={handleImportClick} role="menuitem">
            ↑ Import from JSON
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className={styles.fileInput}
            onChange={handleFileChange}
            aria-hidden="true"
          />

          {message && (
            <span
              className={
                message.type === 'error'
                  ? styles.errMsg
                  : message.type === 'info'
                    ? styles.infoMsg
                    : styles.okMsg
              }
            >
              {message.text}
            </span>
          )}

          <details className={styles.help}>
            <summary className={styles.helpSummary}>💡 How data/tasks.json works</summary>
            <div className={styles.helpText}>
              <p>
                <strong>data/tasks.json</strong> is the seed file in this repo. On your first visit
                (no saved data in browser), it loads these tasks. After that, all changes save to
                your browser's local storage automatically.
              </p>
              <p>
                <strong>To write directly to the file:</strong> Click "Connect to data folder" and
                pick your <code>data/</code> directory. The app will read and write{' '}
                <code>tasks.json</code> on every change — every add, delete, toggle, and edit syncs
                straight to the file on disk.
              </p>
              <p>
                <strong>To version-control your tasks:</strong> Connect to the folder, make changes
                in the app, then <code>git add data/tasks.json && git commit</code> — the file is
                already updated.
              </p>
            </div>
          </details>
        </div>
      )}
      </div>
  );
}
