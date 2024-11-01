import React, { useState } from 'react';
import { auth } from "@/firebaseConfig";  // Add this import
import './JoinTable.css';

const JoinTableButton = ({ tableId, table, onJoinTable }) => {
    const [open, setOpen] = useState(false);

    const isTableFull = (table?.players?.length || 0) >= (table?.max_players || 0);

    const handleClickOpen = () => {
        const userId = auth?.currentUser?.uid;
        if (userId) {
            if (!isTableFull) {
                onJoinTable(tableId, userId);
                console.log("Joining table:", tableId, "User:", userId);  // Debug log
            }
        } else {
            console.log("No user logged in");  // Debug log
        }
    };

    return (
        <>
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
        </>
    );
};

export default JoinTableButton;