import styles from "./page.module.css";
import Link from 'next/link';

export default function Home() {
  return (
      <div>
        <main className={styles.main}>
            <Link href="/gameplay">cardDisplay</Link>
        </main>
      </div>
  );
}
