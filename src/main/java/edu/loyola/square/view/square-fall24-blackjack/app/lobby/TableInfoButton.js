//TableInfoButton
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { auth } from "@/firebaseConfig";
import './TableInfo.css';
import './Modal.css';

const TableInfoButton = ({ tableId, table, users, onJoinTable, disabled = false }) => {
    const [open, setOpen] = useState(false);

    console.log("Table full check:", {
        currentPlayers: table?.players?.length,
        maxPlayers: table?.max_players,
        isTableFull: table?.players?.length >= table?.max_players
    });

    const isTableFull = (table?.players?.length || 0) >= (table?.max_players || 0);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleJoin = () => {
        const userId = auth?.currentUser?.uid;
        if (userId) {
            if (table.players.length < table.max_players) {
                onJoinTable(tableId, userId);
            }
            return;
        }
        handleClose();
    };

    const getUserName = (userId) => {
        const user = users.find(user => user.id === userId);
        return user?.username || userId;
    };

    return (
        <>
            <button
                className="table-info-button"
                onClick={handleClickOpen}
                disabled={disabled}
                style={{
                    backgroundColor: '#468cff',
                    color: 'white'
                }}
            >
                Table Info
            </button>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="table-info-dialog-title"
                PaperProps={{
                    style: {
                        borderRadius: '8px',
                        padding: '8px',
                        width: '600px',
                        height: '500px'
                    }
                }}
            >
                <DialogTitle
                    id="table-info-dialog-title"
                    style={{
                        padding: '16px 24px',
                        fontSize: '1.25rem',
                        fontWeight: 500
                    }}
                >
                    {table?.table_Name}
                </DialogTitle>
                <DialogContent style={{ padding: '16px 24px' }}>
                    <DialogContentText>
                        <div style={{}}>
                            <div style={{
                                fontWeight: 600,
                                color: 'black',
                                marginBottom: '8px'
                            }}>
                                Player Information:
                            </div>
                            Max Players: {table?.max_players || 0}
                        </div>
                        <div style={{marginBottom: '16px'}}>
                            <div style={{
                                fontWeight: 600,
                                color: 'black',
                                marginBottom: '8px'
                            }}>
                            </div>
                            Current Players: {table?.players?.length > 0 ? table.players.map(playerId => getUserName(playerId)).join(', ') : 'No players'} ({table?.players?.length || 0}/{table?.max_players})
                        </div>
                        <div>
                            <div style={{
                                fontWeight: 600,
                                color: 'black',
                                marginBottom: '8px'
                            }}>
                                Betting Information:
                            </div>
                            Minimum Bet: ${table?.minimum_bet || 'N/A'}
                        </div>
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{
                    padding: '16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <Button
                        onClick={handleClose}
                        className="close-button"
                    >
                        Close
                    </Button>
                    <Button
                        onClick={handleJoin}
                        className="join-button"
                        disabled={isTableFull}
                        style={{
                            backgroundColor: isTableFull ? '#9ca3af' : '#22c55e',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 500,
                            opacity: isTableFull ? 0.9 : 1,
                            pointerEvents: isTableFull ? 'none' : 'auto',
                            cursor: isTableFull ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isTableFull ? 'Table Full' : 'Join Table'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TableInfoButton;