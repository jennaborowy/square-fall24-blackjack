"use client"
import React, { useState, useEffect } from 'react';
import { auth } from "@/firebaseConfig";
import { db } from "@/firebaseConfig";
import { collection, addDoc, onSnapshot, query, doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import TableList from "@/app/lobby/TableList";
import CreateTableButton from "@/app/lobby/CreateTableButton";
import {Dialog, DialogActions, DialogContent, DialogContentText} from "@mui/material";

function Lobby() {
    const [tables, setTables] = useState([]);
    const [users, setUsers] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const[userBalance, setChipBalance] = useState();

    const router = useRouter()
    //Upon entering lobby, check user's chipBalance. Reset to 2500 if 0 and show popup to notify user of change
    //CHECK THIS OUT -emma, here's why: The gameplay can recognize whether the user wins or loses and the appropriate payout
    //and here we can accurately display the user's chip amount then trigger a popup if the user runs out of chips.
    //Using onAuthStateChanged allows th popup to show up immediately after returning to lobby
    useEffect(() => {
        const checkUserPoints = auth.onAuthStateChanged( async () => {
            const curUser = auth.currentUser;
            if(!curUser)
                return
            if (curUser) {
                const user = curUser.uid;
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

    useEffect(() => {
        const q = query(collection(db, "users"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log("Users data:", userData);
            setUsers(userData);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const q = query(collection(db, "Table"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tableData = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log("Raw table data:", data);
                console.log("Players array:", data.players);
                return {
                    id: doc.id,
                    ...data,
                    playerNames: data.players.map(playerId => getUserName(playerId))
                };
            });
            console.log("Processed table data:", tableData);
            setTables(tableData);
        });

        return () => unsubscribe();
    }, []);

    const getUserName = (userId) => {
        const user = users.find(user => user.id === userId);
        return user?.username || 'Guest';
    };

    const handleTableCreate = async (newTable) => {
        try {

            const tableData = {
                table_Name: newTable.tableName,
                max_players: Number(newTable.playerAmount),
                minimum_bet: newTable.minBet,
                players: [], // Start with empty players array
                createdBy: auth.currentUser.uid,
            };

            // Create the table
            const docRef = await addDoc(collection(db, "Table"), tableData);

            // Join the table as the creator
            await handleJoinTable(docRef.id, auth.currentUser.uid);

        } catch (error) {
            console.error("Error creating table: ", error);
        }
    };

    const handleJoinTable = async (tableId, userId) => {
        try {
            const tableRef = doc(db, "Table", tableId);

            const tableDoc = await getDoc(tableRef);
            if (!tableDoc.exists()) {
                throw new Error("Table not found");
            }

            const tableData = tableDoc.data();
            const currentPlayers = tableData.players || [];

            // If this is the creator joining their own newly created table
            if (tableData.createdBy === userId) {
                // Add them to players list if they're not already in it
                if (!currentPlayers.includes(userId)) {
                    await updateDoc(tableRef, {
                        players: arrayUnion(userId)
                    });
                }
                // Navigate immediately for the creator
                router.push(`/gameplay/${tableId}`);  // Changed from /game to /gameplay
                return true;
            }
            if (currentPlayers.length >= tableData.max_players) {
                throw new Error("Table is full");
            }
            if (currentPlayers.includes(userId)) {
                console.log("Player already in table, navigating to game...");
                router.push(`/gameplay/${tableId}`);
                return true;
            }
            // Add player to table
            await updateDoc(tableRef, {
                players: arrayUnion(userId)
            });
            // Navigate to game page
            console.log("Successfully joined table, navigating to game...");
            router.push(`/gameplay/${tableId}`);
            return true;
        } catch (error) {
            console.error("Error joining table:", error);
            throw error;
        }
    };

    return (
        <div className="m-3" title="lobby">
            <h1 className="text-2xl font-bold mb-4">Welcome to the Lobby!</h1>

            {/*This is the popup to notify user of chipBalance change*/}
            <Dialog
                open={showPopup}
                onClose={handleClosePopup}>
                <DialogContent>
                    <DialogContentText>
                        <p>
                            It seems that youve ran out of chips... Have some more
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

            <TableList
                tables={tables}
                onJoinTable={handleJoinTable}
                users={users}
            />
            <div className="mb-4">
                <CreateTableButton onTableCreate={handleTableCreate}/>
            </div>
            <h1> ${userBalance} </h1>
        </div>
    );
}

export default Lobby;
