"use client"
import React, { useState, useEffect } from 'react';
import { auth } from "@/firebaseConfig";
import { db } from "@/firebaseConfig";
import { collection, addDoc, onSnapshot, query, doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import TableList from "@/app/lobby/TableList";
import CreateTableButton from "@/app/lobby/CreateTableButton";


function Lobby() {
    const [tables, setTables] = useState([]);

    const [users, setUsers] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "users"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log("Users data:", userData);  // Add this
            setUsers(userData);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const q = query(collection(db, "Table"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tableData = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log("Raw table data:", data);  // Add this
                console.log("Players array:", data.players);  // Add this
                return {
                    id: doc.id,
                    ...data,
                    playerNames: data.players.map(playerId => getUserName(playerId))
                };
            });
            console.log("Processed table data:", tableData);  // Add this
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
                players: [],
                createdBy: auth?.currentUser?.uid,
            };

            await addDoc(collection(db, "Table"), tableData);
        } catch (error) {
            console.error("Error creating table: ", error);
        }
    };

    const handleJoinTable = async (tableId, userId) => {
        try {
            const tableRef = doc(db, "Table", tableId);

            const tableDoc = await getDoc(tableRef);
            if (tableDoc.exists()) {
                const currentPlayers = tableDoc.data().players || [];

                if (!currentPlayers.includes(userId)) {
                    await updateDoc(tableRef, {
                        players: arrayUnion(userId)
                    });
                }
            }
        } catch (error) {
            console.error("Error joining table:", error);
        }
    };

    return (
        <div className="m-3">
            <h1 className="text-2xl font-bold mb-4">Welcome to the Lobby!</h1>
            <TableList
                tables={tables}
                onJoinTable={handleJoinTable}
                users={users}
            />
            <div className="mb-4">
                <CreateTableButton onTableCreate={handleTableCreate}/>
            </div>
        </div>
    );
}

export default Lobby;