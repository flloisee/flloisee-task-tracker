import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <hr className={styles.rule} />
      <p className={styles.text}>
        flloisee's task tracker <span className={styles.dot}>·</span> Designed with{' '}
        <span className={styles.highlight}>Hallmark</span> ·{' '}
        <span className={styles.highlight}>Hum</span> <span className={styles.dot}>·</span> Made by flloisee
      </p>
    </footer>
  );
}
