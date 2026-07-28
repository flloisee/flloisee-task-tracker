
import styles from './ConnectFolderBanner.module.css';

interface Props {
  onConnect: () => void;
  onReauth: () => void;
  isSupported: boolean;
  needsReauth: boolean;
}

export function ConnectFolderBanner({ onConnect, onReauth, isSupported, needsReauth }: Props) {
  return (
      <div className={styles.banner} role="status">
        <div className={styles.inner}>
          {needsReauth ? (
            <>
              <p className={styles.message}>
                Previously connected folder needs re-authorisation.{' '}
                Tap below to re-grant permission.
              </p>
              <button className={styles.connectBtn} onClick={onReauth}>
                🔄 Reconnect to data folder
              </button>
            </>
          ) : (
            <>
              <p className={styles.message}>
                <strong>flloisee's task tracker</strong> can write your tasks directly to{' '}
                <code>data/tasks.json</code> on your computer — no backend needed.
              </p>
              {isSupported ? (
                <button className={styles.connectBtn} onClick={onConnect}>
                  📁 Connect to data folder
                </button>
              ) : (
                <p className={styles.fallback}>
                  Your browser doesn't support direct file access.{' '}
                  <button
                    className={styles.textBtn}
                    onClick={() => {
                      document.querySelector<HTMLElement>('[data-action="open-data-manager"]')?.click();
                    }}
                  >
                    Use Export/Import instead
                  </button>
                </p>
              )}
            </>
          )}
          <details className={styles.help}>
            <summary>How does this work?</summary>
            <p>
              Click "Connect" → pick your <code>data/</code> folder in the repo → the app reads and
              writes <code>tasks.json</code> directly. Changes are instant and you can commit them to
              git.
            </p>
          </details>
        </div>
      </div>
  );
}
