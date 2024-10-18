import React from 'react'
import Paper from '@mui/material/Paper'
import Grid2 from '@mui/material/Grid2'
import Link from "next/link";
import Image from "next/image";
import style from "./signup.css"

const Page=()=> {
    const paperStyle={padding:15, height:'78vh', width:'50vh',margin:"30px auto"}

    return (
        <div className="Signup">
            <div className={"left"}>
                <div className={"leftimg"}>
                    <Image src={"/coins.png"}
                           alt=""
                           height={600}
                           width={600}
                    />
                </div>
           </div>
              <div className={"middle"}>
                  <Grid2>
                       <Paper elevation={7} style={paperStyle}>
                          <Grid2 align={"center"}>
                              <Image src={"/logo-transparent.png"}
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

                                  <div className="create-acct">
                                      <button className="create-acct-btn" >
                                          <Link href="/login"> Create Account</Link>
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
                                  <div className={"guest"}>
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
            <div className={"right"}>
            <div className="rightimg">
                    <Image src={"/coins.png"}
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
