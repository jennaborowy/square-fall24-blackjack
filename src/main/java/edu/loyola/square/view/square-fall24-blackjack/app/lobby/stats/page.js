"use client"
import "../../globals.css"
import "./stats.css"
import React, {useEffect, useState} from "react";
import {auth, db} from "@/firebaseConfig";
import {doc, getDoc} from "firebase/firestore";

function Stats() {
    const [losses, setLosses] = useState("");
    const [wins, setWins] = useState("");
    const[chips, setChips] = useState("");

    //get the user's total wins and losses
    useEffect( () => {
        const display = auth.onAuthStateChanged(async ()=>
        {
            const curUser = auth.currentUser;
            if(!curUser)
                return
            if (curUser) {
                const user = curUser.uid;
                const docRef = doc(db, 'users', user);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setLosses(docSnap.data()['totalLosses']);
                    setWins(docSnap.data()['totalWins']);
                    setChips(docSnap.data()['chipBalance']);
                }
            }
        });
        return ()=> display;
    });

    return (
        <div className="container">
            <div title={"display"}>
                {/*Display user's number of wins and losses*/}
            <img src={"/stats-transformed.png"}
                 alt=""
                 height={150}
                 width={400}
                 style={{alignSelf: "center", margin: "20px"}}
            />
            </div>
            <h1>
                Total wins: {wins}
            </h1>
            <h1>
                Total losses: {losses}
            </h1>
            <h1>
                Current Chip Total: ${chips}
            </h1>
        </div>
    );
}

export default Stats;