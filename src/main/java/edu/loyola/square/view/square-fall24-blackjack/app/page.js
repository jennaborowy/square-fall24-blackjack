import Image from "next/image";
import styles from "./page.module.css";
import {Button, ButtonToolbar, Form} from "rsuite";
import React from "react"
import Link from "next/link";
import Login from "@/app/login/page.js"
import ReactDOM from "react-dom"

// the ui for root url
export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
          <img className="container-sm" src="/Blackjack.png" alt="The Winning Hand Co. logo"/>
          <footer className={styles.footer}>
              <Link href="/login">Login</Link>
              <Link href="/signup">Signup</Link>
          </footer>
      </main>
    </div>
  );
}
