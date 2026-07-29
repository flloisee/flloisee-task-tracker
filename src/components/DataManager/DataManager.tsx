import { useState, useRef, useCallback, useEffect } from 'react';
import { exportTasksAsJson, importTasksFromJson, checkHandleState } from '../../services/storageService';
import type { HandleState, StorageBackend } from '../../services/storageService';
import styles from './DataManager.module.css';

interface Props {
  storageBackend: StorageBackend;
  onStorageBackendChange: (backend: StorageBackend) => void;
  onImportComplete: () => void;
  onDisconnect: () => void;
  onReconnect: () => void;
  onReauth: () => void;
}

export function DataManager({ storageBackend, onStorageBackendChange, onImportComplete, onReconnect, onReauth }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'ok' | 'error' | 'info' } | null>(null);
  const [handleState, setHandleState] = useState<HandleState>('none');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supported = 'showDirectoryPicker' in window;

  // Check connection state on mount and after the panel opens
  const checkConnection = useCallback(async () => {
    setHandleState(await checkHandleState());
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

  const handleBackendChange = useCallback(async (backend: StorageBackend) => {
    onStorageBackendChange(backend);
    if (backend === 'file') {
      if (!supported) {
        setMessage({ text: 'File access not supported in this browser', type: 'error' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      const state = await checkHandleState();
      setHandleState(state);
      if (state === 'none') {
        try {
          await onReconnect();
          setHandleState('granted');
          setMessage({ text: 'Connected to tasks.json!', type: 'ok' });
        } catch {
          setHandleState('none');
          setMessage({ text: 'Connection cancelled.', type: 'error' });
          setTimeout(() => setMessage(null), 3000);
          return;
        }
      } else if (state === 'stored') {
        try {
          await onReauth();
          setHandleState('granted');
          setMessage({ text: 'Reconnected!', type: 'ok' });
        } catch {
          setHandleState('stored');
          setMessage({ text: 'Re-authorisation cancelled.', type: 'error' });
          setTimeout(() => setMessage(null), 3000);
          return;
        }
      } else {
        onImportComplete();
        setMessage({ text: 'Connected to tasks.json!', type: 'ok' });
      }
    } else {
      onImportComplete();
      setMessage({ text: 'Using local storage. Data stays in browser.', type: 'info' });
    }
    setTimeout(() => setMessage(null), 3000);
  }, [onStorageBackendChange, onReconnect, onReauth, onImportComplete, supported]);

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
      if (handleState === 'stored') {
        await onReauth();
      } else {
        await onReconnect();
      }
      setHandleState('granted');
      setMessage({ text: 'Connected to data/tasks.json!', type: 'ok' });
    } catch {
      setHandleState('none');
      setMessage({ text: 'Connection cancelled.', type: 'error' });
    }
    setTimeout(() => setMessage(null), 3000);
  }, [handleState, onReauth, onReconnect]);

  return (
      <div className={styles.wrapper} ref={wrapperRef}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(o => { if (!o) checkConnection(); return !o; })}
        aria-label="Data options"
        title={storageBackend === 'file' && handleState === 'granted' ? 'Saving to tasks.json' : 'Saving to local storage'}
        data-action="open-data-manager"
      >
        {storageBackend === 'file' ? '💾' : '💿'}
      </button>

      {open && (
        <div className={styles.panel} role="menu">
          <div className={styles.sourceToggle}>
            <span className={styles.sourceLabel}>Storage</span>
            <div className={styles.sourceOptions}>
              <button
                className={`${styles.sourceOption} ${storageBackend === 'local' ? styles.sourceActive : ''}`}
                onClick={() => handleBackendChange('local')}
                disabled={false}
                role="menuitem"
              >
                Local (browser)
              </button>
              <button
                className={`${styles.sourceOption} ${storageBackend === 'file' ? styles.sourceActive : ''}`}
                onClick={() => handleBackendChange('file')}
                disabled={!supported}
                role="menuitem"
                title={!supported ? 'File System Access API not supported in this browser' : ''}
              >
                File (tasks.json)
              </button>
            </div>
          </div>

          {storageBackend === 'file' && (
            <>
              <div className={styles.statusRow}>
                <span className={handleState === 'granted' ? styles.connected : styles.disconnected}>
                  {handleState === 'granted'
                    ? '● Connected — writes to data/tasks.json'
                    : handleState === 'stored'
                      ? '○ Handle stored — tap to re-authorise'
                      : '○ Not connected — connect to write to tasks.json'}
                </span>
              </div>

              <button className={styles.action} onClick={handleToggleConnection} role="menuitem">
                {handleState === 'granted'
                  ? '📁 Change data folder'
                  : handleState === 'stored'
                    ? '🔑 Reconnect to data folder'
                    : '📁 Connect to data folder'}
              </button>
            </>
          )}

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
            <summary className={styles.helpSummary}>💡 How storage works</summary>
            <div className={styles.helpText}>
              <p>
                <strong>Local (browser):</strong> All data is saved to your browser's local storage.
                It persists across sessions but is tied to this browser. No file needed.
              </p>
              <p>
                <strong>File (tasks.json):</strong> Pick a folder and the app reads/writes{' '}
                <code>tasks.json</code> directly. Every add, delete, toggle, and edit syncs straight
                to the file on disk. Switch back to "Local" anytime.
              </p>
            </div>
          </details>
        </div>
      )}
      </div>
  );
}
