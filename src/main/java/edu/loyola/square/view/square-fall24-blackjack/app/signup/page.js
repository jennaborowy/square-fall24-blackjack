"use client"

import React, { useState } from 'react'
import Link from "next/link";
import { useRouter } from 'next/navigation';

import "./signup.css"
import "../globals.css"

const Page=()=> {

    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        async function createAccount(userUsername, userPassword, userEmail, userFirst, userLast) {
            let url = `http://localhost:8080/api/user/signup`;

            let headers = {
                'Content-Type': 'application/json',
            };

            let body = {
                "username": userUsername,
                "password": userPassword,
                "email": userEmail,
                "first_name": userFirst,
                "last_name": userLast,
            };

            await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            })
                .then((res) => {
                    if (res.ok) {
                        console.log(res.status)
                        router.push('/login') // was ../login
                    } else {
                        // make loginErr
                        // check if password fields match
                        // customize dialog message for that (could make function that returns String with errors)
                    }
                });
        }
        await createAccount(username, password, email, first, last);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "username") {
            setUsername(value);
        } else if (name === "password") {
            setPassword(value);
        } else if (name === "first") {
            setFirst(value);
        } else if (name === "last") {
            setLast(value);
        } else if (name === "email") {
            setEmail(value);
        }
    }

    return (
        <div className="container">
            <div className="form-container">
                <img src={"/logo-transparent.png"}
                     alt=""
                     height={215}
                     width={290}
                     style={{alignSelf:"center"}}
                />

                <div className="title">
                    <h1>Signup</h1>
                </div>

                <div className="form">
                    <form action={""}>

                        <div className="input">
                            <input type="text" placeholder="First Name" required/>
                        </div>

                        <div className="input">
                            <input type="text" placeholder="Last Name" required/>
                        </div>

                        <div className="input">
                            <input type="text" placeholder="Username" required/>
                        </div>

                        <div className="input">
                            <input type="text" placeholder="Email" required/>
                        </div>

                        <div className="input">
                            <input type="text" placeholder="Password" required/>
                        </div>

                        <div className="input">
                            <input type="text" placeholder="Confirm Password" required/>
                        </div>

                        <button className="create-acct-btn" >
                            <Link href="/login"> Create Account</Link>
                        </button>

                        <div className="login">
                            <p>Already a user?
                                <span>
                                    <Link href="/login"> Login</Link>
                                </span>
                            </p>

                            <p>- or -</p>

                        </div>
                        <div className={"guest"}>
                            <p>Continue as
                                <span>
                                    <Link href="/table"> Guest</Link>
                                </span>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    );
}
export default Page
