"use client";
import styles from "./page.module.css";
import Link from 'next/link'
import React, {useState} from "react";
import {Dialog, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import Image from "next/image";


export default function Home() {
    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

  return (
      <div className="main">
          <div className={styles.left}>
              <div className={styles.leftimg}>
                  <Image src={"/coins.png"}
                         alt=""
                         height={500}
                         width={500}
                  />
              </div>
          </div>
          <div className={styles.middle}>
              <img src={"/logo-transparent.png"}
                   alt=""
                   height={415}
                   width={530}
                   style={{alignSelf: "center"}}/>

              <div className={styles.container}>
                  <button className={styles.btn}>
                      <Link href="/signup">Signup</Link>
                  </button>
                  <button className={styles.btn}>
                      <Link href="/login">Login</Link>
                  </button>
                  <button className={styles.btn} onClick={handleClickOpen}>
                      Tutorial
                  </button>
                  <Dialog
                      open={open}
                      onClose={handleClose}>
                      <DialogTitle>
                          {"How to Play Blackjack"}
                      </DialogTitle>
                      <DialogContent>
                          <DialogContentText>
                              <p>
                                  So you don't know how to play Blackjack...
                              </p>
                              <p>
                                  The goal is to get your cards to a total value of 21 without going over 21.
                                  Card' numbers correspond to their point values. Aces can be 1 or 11 points. Face cards
                                  are 10 points.
                                  You are dealt two cards originally and can HIT or STAND. Hit gives you another card,
                                  stand
                                  leaves you with your current cards.
                              </p>
                              <p>
                                  You win if your hand's value is greater than the value of the dealer's hand.
                              </p>
                              <p>
                                  <a href="https://bicyclecards.com/how-to-play/blackjack">
                                      Click here for more Blackjack info.
                                  </a>
                              </p>
                          </DialogContentText>
                      </DialogContent>
                  </Dialog>
              </div>
          </div>
          <div className={styles.right}>
              <div className={styles.rightimg}>
                  <Image src={"/coins.png"}
                         alt=""
                         height={500}
                         width={500}
                  />
              </div>
          </div>
      </div>

);
}
