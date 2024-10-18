import styles from "./page.module.css";
import Link from 'next/link'
import React from "react";

export default function Home() {

  return (
      <div>
        <main className={styles.main}>
            <Link href="/signup">Signup</Link>
            <Link href="/login">Login</Link>
        </main>
    </div>
  );
}
