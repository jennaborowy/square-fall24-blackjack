"use client"
import React, {useEffect, useState} from 'react';
import { auth, db } from "@/firebaseConfig";
import TableList from "@/app/lobby/TableList";
import CreateTableButton from "@/app/lobby/CreateTableButton";
import {doc, getDoc, updateDoc} from "firebase/firestore";
import {Dialog, DialogActions, DialogContent, DialogContentText} from "@mui/material";

function Lobby() {
    const [tables, setTables] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const[userBalance, setChipBalance] = useState();

    //Upon entering lobby, check user's chipBalance. Reset to 2500 if 0 and show popup to notify user of change
    useEffect(() => {
        const checkUserPoints = auth.onAuthStateChanged( async () => {
            const user = auth.currentUser.uid;

            if (user) {
                const docRef = doc(db, 'users', user);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const points = docSnap.data()['chipBalance'];

                    if (points === 0) {
                        setShowPopup(true);
                        await updateDoc(docRef, {chipBalance: 2500});
                    }
                    setChipBalance(points);
                }
            }
        });
        return ()=> checkUserPoints();
    });

    //close chipBalance popup
    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleTableCreate = (newTable) => {
        setTables(prevTables => [...prevTables, newTable]);
    };

    console.log(auth?.currentUser?.uid);

    return (
        <div className="m-3">
            {/*This is the popup to notify user of chipBalance change*/}
            <Dialog
                open={showPopup}
                onClose={handleClosePopup}>
                <DialogContent>
                    <DialogContentText>
                        <p>
                            It seems that you've ran out of chips... Have some more
                        </p>
                        <p>
                            New chip balance: 2500
                        </p>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <button className="mt-3 btn btn-success border" onClick={handleClosePopup}>
                        Ok
                    </button>
                </DialogActions>
            </Dialog>

            <h1>Welcome to the Lobby!</h1>
            <TableList tables={tables}/>
            <CreateTableButton onTableCreate={handleTableCreate}/>

            <h1> ${userBalance} </h1>
        </div>

    )
}

export default Lobby;