import styles from "./page.module.css";
import Link from 'next/link'
import React from "react";

export default function Home() {

  return (

          <main className={styles.main}>
              <img src={"/logo-transparent.png"}
                   alt=""
                   height={415}
                   width={530}
                   style={{alignSelf:"center"}}/>

            <div className={styles.container}>
              <button className={styles.btn}>
                <Link href="/signup">Signup</Link>
              </button>
              <button className={styles.btn}>
                <Link href="/login">Login</Link>
              </button>
              <button className={styles.btn}>
                <Link href="/gameplay">Play Game</Link>
              </button>
            </div>

          </main>

  );
}
