"use client"
import React, { useState, useEffect } from 'react';
import { auth } from "@/firebaseConfig";
import { db } from "@/firebaseConfig";
import { collection, addDoc, onSnapshot, query, doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import TableList from "@/app/lobby/TableList";
import CreateTableButton from "@/app/lobby/CreateTableButton";

function Lobby() {
    const [tables, setTables] = useState([]);
    const [users, setUsers] = useState([]);
    const router = useRouter();

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
            if (!tableDoc.exists()) {
                throw new Error("Table not found");
            }

            const tableData = tableDoc.data();
            const currentPlayers = tableData.players || [];

            // Check if table is full
            if (currentPlayers.length >= tableData.max_players) {
                throw new Error("Table is full");
            }

            // Check if player is already in the table
            if (currentPlayers.includes(userId)) {
                console.log("Player already in table, navigating to game...");
                router.push(`/game/${tableId}`);
                return true;
            }

            // Add player to table
            await updateDoc(tableRef, {
                players: arrayUnion(userId)
            });

            // Navigate to game page
            console.log("Successfully joined table, navigating to game...");
            router.push(`/game/${tableId}`);
            return true;

        } catch (error) {
            console.error("Error joining table:", error);
            throw error;
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