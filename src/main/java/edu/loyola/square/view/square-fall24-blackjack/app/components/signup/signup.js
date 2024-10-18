import React from 'react'
import styles from './signup.css'
import Paper from '@mui/material/Paper'
import Grid2 from '@mui/material/Grid2'
import coin from "../../assets/coins.png"
import logo from "../../assets/Blackjack.png"
import Box from '@mui/material/Box'
import Login from "../login/login.css"


const Signup=()=> {
    const paperStyle={padding:10, height:'75vh', width:'50vh'}
    return (
        <div className="Signup">
            <Grid2>
                <Paper elevation={5} style={paperStyle}>
                    <Grid2 align={"center"}>
                        <img src={logo}
                             alt=""
                             height={150}
                             width={150}
                             style={{alignSelf:"center"}}
                             />
                        <h1>Signup</h1>
                        <form action={""}>
                            <div className="input">
                                <input type="text" placeholder="Username" required/>
                            </div>
                            <div className="input">
                                <input type="text" placeholder="Password" required/>
                            </div>
                            <div className="input">
                                <input type="text" placeholder="Confirm Password" required/>
                            </div>

                            <div className="login">
                                <p>Already a user?
                                    <a href={"#"}> Login</a>
                                </p>
                                <p>- or -</p>

                            </div>
                            <div className={"guest"}>
                                <p>Continue as
                                    <a href={"#"}> Guest</a>
                                </p>

                            </div>
                        </form>
                    </Grid2>

                </Paper>
            </Grid2>


        </div>

    );
}
export default Signup
