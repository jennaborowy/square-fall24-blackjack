import Image from "next/image";
import styles from "./page.module.css";
import Signup from './components/signup/signup'
import React from "react";

export default function Home() {
  return (
    <div className={styles.page}>
        <main className={styles.main}>
            <Signup/>

        </main>
    </div>
  );
}
