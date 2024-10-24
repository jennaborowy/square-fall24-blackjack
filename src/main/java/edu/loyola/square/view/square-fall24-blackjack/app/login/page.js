"use client";
import "../globals.css";
import { useRouter } from 'next/navigation';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import React, { useState } from "react";
import Link from "next/Link";

import styles from "@/app/page.module.css";
import "./login.css";
import Image from "next/image";

function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loginErr, setLoginErr] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        async function login(userUsername, userPassword) {
            let url = `http://localhost:8080/api/user/login`;

            let headers = {
                'Content-Type': 'application/json',
            };

            let body = {
                "username": userUsername,
                "password": userPassword,
            };

            await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
                cache: 'no-cache',
            })
                .then((res) => {
                    if (res.ok) {
                        router.push('/lobby');
                    } else {
                        setLoginErr(true);
                        console.log(res.json);
                    }
                });
        }

        await login(username, password);
    }

    const handleClose = () => {
        setLoginErr(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "username") {
            setUsername(value);
        } else if (name === "password") {
            setPassword(value);
        }
    };

    return (

        <div className="container">
            <img src={"/logo-transparent.png"}
                 alt=""
                 height={215}
                 width={290}
                 style={{alignSelf: "center"}}
            />
            <div className="title">
                <h1>Login</h1>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username"></label>
                    <input
                        className="form-control"
                        type="text"
                        id="username"
                        name="username"
                        title="Enter username"
                        placeholder="Username"
                        value={username}
                        onInput={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password"></label>
                    <input
                        className="form-control"
                        type="password"
                        id="password"
                        name="password"
                        title="Enter password"
                        placeholder="Password"
                        value={password}
                        onInput={handleChange}
                    />
                </div>
                <button className="mt-3 btn btn-success border" type="submit">Submit</button>
            </form>

            <footer className="footer">
                <Link
                    href="/signup"
                >
                    <Image
                        aria-hidden
                        src="https://nextjs.org/icons/file.svg"
                        alt="File icon"
                        width={16}
                        height={16}
                    />
                    Sign up for Account
                </Link>
            </footer>
            <Dialog
                onClose={handleClose}
                open={loginErr}
            >
                <DialogTitle id="alert-dialog-title">
                    {"Error"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Username or password is incorrect. Please try again.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <button className="btn btn-light border" onClick={handleClose}>Exit</button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Login;