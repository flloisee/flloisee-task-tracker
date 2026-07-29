import styles from './ReauthBanner.module.css';

interface Props {
  onReauth: () => void;
}

export function ReauthBanner({ onReauth }: Props) {
  return (
    <div className={styles.banner}>
      <span className={styles.text}>
        File access expired — tap to reconnect to your tasks.json file
      </span>
      <button className={styles.button} onClick={onReauth}>
        Re-authorize
      </button>
    </div>
  );
}
