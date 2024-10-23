"use client"

import React, { useState } from 'react'
import Paper from '@mui/material/Paper'
import Grid2 from '@mui/material/Grid2'
import Link from "next/link";
import Image from "next/image";
import "./signup.css"
import { useRouter } from 'next/navigation';

const Page=()=> {
    const paperStyle={padding:15,  width:'30vw',margin:"30px auto"}

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
        <div className="Signup">
            <div className="left">
                <div className="leftimg">
                    <Image src="/coins.png"
                           alt=""
                           height={600}
                           width={600}
                    />
                </div>
           </div>
              <div className="middle">
                  <Grid2>
                       <Paper elevation={7} style={paperStyle}>
                          <Grid2 align={"center"}>
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
                                  <form action={""} onSubmit={handleSubmit}>

                                      <div className="input">
                                          <input type="text" placeholder="First Name" name="first" onInput={handleChange} required/>
                                      </div>

                                      <div className="input">
                                          <input type="text" placeholder="Last Name" name="last" onInput={handleChange} required/>
                                      </div>

                                      <div className="input">
                                          <input type="text" placeholder="Username" name="user" onInput={handleChange} required/>
                                      </div>

                                      <div className="input">
                                          <input type="text" placeholder="Email" name="email" onInput={handleChange} required/>
                                      </div>

                                      <div className="input">
                                          <input type="text" placeholder="Password" name="password" onInput={handleChange} required/>
                                      </div>

                                      <div className="input">
                                          <input type="text" placeholder="Confirm Password" required/>
                                      </div>

                                      <div className="create-acct">
                                          <button className="create-acct-btn" >
                                              <Link href="/login">Create Account</Link>
                                          </button>
                                      </div>

                                      <div className="login">
                                          <p>Already a user?
                                              <span>
                                                  <Link href="/login"> Login</Link>
                                              </span>
                                          </p>

                                          <p>- or -</p>

                                      </div>
                                      <div className="guest">
                                          <p>Continue as
                                              <span>
                                                  <Link href="/table"> Guest</Link>
                                              </span>
                                          </p>
                                      </div>
                                  </form>
                              </div>
                          </Grid2>
                       </Paper>
                  </Grid2>
              </div>
            <div className="right">
                <div className="rightimg">
                    <Image src="/coins.png"
                        alt=""
                        height={600}
                        width={600}
                    />
                </div>
            </div>
        </div>

    );
}
export default Page
