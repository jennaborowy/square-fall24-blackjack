"use client";
import "../../globals.css";

import React, { useState, useRef } from "react";
import Link from "next/Link";

import { Form, ButtonToolbar, Button, Input } from 'rsuite';
import styles from "@/app/page.module.css";
import Image from "next/image";

function Login() {
    const initialData = {
        username: "",
        password: ""
    };

    const [data, setData] = useState(initialData);
    // const [username, setUsername] = useState("");
    // const [password, setPassword] = useState("");

    // indicates whether post request was succesful or not
    const [success, setSuccess] = useState('');
    const [errors, setErrors] = useState([]);

    //
    const userRef = useRef(null);
    const passRef = useRef(null);

    // prevents form from submitting
    const handleSubmit = async (e) => {
        e.preventDefault();
    }

    // // do a post request to backend
    // try {
    //     // send POST request using axios
    //
    //     // setSuccess("Data received")
    // } catch (err) {
    //     handleErrors(err);
    // }

    // const handleErrors = (err) => {
    //
    // }

    const handleChange = (e) => {
        setData({
            ...data, [e.target.name]: e.target.value,
        });
        setSuccess("");
        setErrors([]);
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <h1>Login</h1>
                <div>
                    <label id="username-label">username</label>
                    <input type="text" name="username" value={data.username} onInput={handleChange}/>
                    <label id="password-label">password</label>
                    <input type="text" name="password" value={data.password} onInput={handleChange}/>
                    <input type="submit" value="submit"/>
                </div>
            </form>
            <h>{data.username}</h>
            <h>{data.password}</h>
            <footer className={styles.footer}>
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
                <a
                    href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image
                        aria-hidden
                        src="https://nextjs.org/icons/window.svg"
                        alt="Window icon"
                        width={16}
                        height={16}
                    />
                    Play as Guest
                </a>
            </footer>
        </>
    );
}

export default Login;