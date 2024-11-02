"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { auth, db } from "@/firebaseConfig";
import { collection, setDoc, doc } from "firebase/firestore";

import { signInAnonymously } from "firebase/auth";

import "./guest.css";

function Guest() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [err, setErr] = useState(false);

    const errMsg = "Guest sign in failed";

    console.log(auth?.currentUser?.uid)

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (auth.currentUser) {
            router.push("/lobby");
        }

        let body = {
            "username": username,
        };

        try {
            const response = await fetch('http://localhost:8080/api/user/guest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if(response.ok) {
                await signInAnonymously(auth);
                console.log("anonymous user created");

                if (auth.currentUser) {
                    const userRef = doc(collection(db, "users"), auth.currentUser.uid);
                    await setDoc(userRef, {
                        username: username,
                        chipBalance: 2500,
                        totalWins: 0,
                        totalLoses: 0,
                    })

                    console.log("guest user in")
                    router.push('/lobby');
                }
            } else {
                const errorData = await response.json();
                console.log(errorData);
            }
        } catch (error) {
            console.log('Error trying playing as guest:', error);
        }
    }

    return (
        <div className="container">
            <img src={"/logo-transparent.png"}
                 alt=""
                 height={215}
                 width={290}
                 style={{alignSelf: "center"}}
            />
            <div className="title">
                <h1>Play as Guest</h1>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email"></label>
                    <input
                        className="form-control"
                        type="text"
                        id="username"
                        name="username"
                        title="username"
                        placeholder="Username"
                        value={username}
                        onInput={(e) => {setUsername(e.target.value)}}
                    />
                </div>
                <button className="mt-3 btn btn-success border" type="submit" name="submit">Submit</button>
            </form>
            <footer className="footer">
                <div className="row">
                    <Link
                        href="/signup"
                    >
                    <span>
                    Sign up for Account
                    </span>
                    </Link>
                </div>
                <div className="row">
                    <Link
                        href="/login"
                    >
                    <span>
                    Sign in
                    </span>
                    </Link>
                </div>
            </footer>
            <Dialog
                onClose={() => {setErr(false)}}
                open={err}
            >
                <DialogTitle id="alert-dialog-title">
                    {"Error"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {errMsg}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <button className="btn btn-light border" onClick={() => {setErr(false)}}>Exit</button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Guest;