"use client";
import styles from "./page.module.css";
import React, { useState } from "react";
import {Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions} from "@mui/material";
import Image from "next/image";
import "./globals.css"

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
                  <img src={"/coins.png"}
                         alt=""
                         height={500}
                         width={500}
                  />
              </div>
          </div>
          <div className={styles.middle}>


              <div className={styles.container}>
                  <img src={"/logo-transparent.png"}
                       alt=""
                       height={415}
                       width={530}
                       style={{alignSelf: "center"}}/>
                  <a href="/signup" className="mt-3 btn btn-success border" role="button">Signup</a>
                  <a href="/login" className="mt-3 btn btn-success border" role="button">Login</a>
                  <a href="/lobby" className="mt-3 btn btn-success border" role="button">Play as Guest</a>
                  <button className="mt-3 btn btn-success border" onClick={handleClickOpen}>
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
                                  <span>
                                  <a href="https://bicyclecards.com/how-to-play/blackjack">
                                      Click here for more Blackjack info.
                                  </a>
                                  </span>
                              </p>
                          </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                          <button className="mt-3 btn btn-success border" onClick={handleClose}>
                              Ok
                          </button>
                      </DialogActions>
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
