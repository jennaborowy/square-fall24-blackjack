// app/lobby/stats/JoinTableButton.js
'use client';
import React, { useState } from 'react';
import { auth } from "@/firebaseConfig";
import { useRouter } from 'next/navigation';
import './JoinTable.css';

const JoinTableButton = ({ tableId, table, onJoinTable }) => {
    const [error, setError] = useState(null);
    const router = useRouter();

    const isTableFull = (table?.players?.length || 0) >= (table?.max_players || 0);

    const handleClickOpen = async () => {
        setError(null);
        const userId = auth?.currentUser?.uid;

        if (!userId) {
            setError("Please log in to join a table");
            console.log("No user logged in");
            return;
        }

        if (isTableFull) {
            setError("Table is full");
            return;
        }

        try {
            // Make sure onJoinTable returns a promise
            const result = await onJoinTable(tableId, userId);

            if (result) {
                // Store necessary data in sessionStorage
                sessionStorage.setItem('gameTableId', tableId);
                sessionStorage.setItem('playerId', userId);
                sessionStorage.setItem('tableName', table.name || '');

                // Navigate to the correct route based on your file structure
                router.push(`/gameplay/${tableId}`);
            }
        } catch (error) {
            console.error("Error joining table:", error);
            setError("Failed to join table. Please try again.");
        }
    };

    return (
        <div>
            <button
                className="join-table-button"
                onClick={handleClickOpen}
                disabled={isTableFull}
                style={{
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 500,
                    opacity: isTableFull ? 0.5 : 1,
                    pointerEvents: isTableFull ? 'none' : 'auto',
                    cursor: isTableFull ? 'not-allowed' : 'pointer'
                }}
            >
                {isTableFull ? 'Table Full' : 'Join Table'}
            </button>
            {error && <div className="error-message" style={{ color: 'red', marginTop: '5px' }}>{error}</div>}
        </div>
    );
};

export default JoinTableButton;