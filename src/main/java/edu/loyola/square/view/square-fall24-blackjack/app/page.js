import styles from "./page.module.css";
import Link from 'next/link'
import React from "react";

export default function Home() {
  return (
    <div className={styles.page}>
        <main className={styles.main}>
            <Link href="/signup">Signup</Link>
            <Link href="/login">Login</Link>
            <Link href="/loading">Loading screen</Link>
        </main>
    </div>
  );
}
