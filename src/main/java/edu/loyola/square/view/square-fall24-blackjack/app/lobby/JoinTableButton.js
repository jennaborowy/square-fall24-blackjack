import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
//import './JoinTable.css';

const JoinTableButton = ({ tableId, disabled = false }) => {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleJoin = () => {
        console.log(`Joining table ${tableId}`);
        handleClose();
    };

    return (
        <>
            <button
                className="join-table-button"
                onClick={handleClickOpen}
                disabled={disabled}
                style={{
                    backgroundColor: '#22c55e',
                    color: 'white',
                    marginRight: '12px' // Added margin between buttons
                }}
            >
                Join Table
            </button>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="join-dialog-title"
                aria-describedby="join-dialog-description"
                PaperProps={{
                    style: {
                        borderRadius: '8px',
                        padding: '8px'
                    }
                }}
            >
                <DialogTitle id="join-dialog-title">
                    Join Table
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="join-dialog-description">
                        Are you sure you want to join this table?
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}> {/* Added more padding in dialog actions */}
                    <Button
                        onClick={handleClose}
                        style={{
                            textTransform: 'none',
                            fontWeight: 500,
                            marginRight: '12px' // Added margin between dialog buttons
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleJoin}
                        autoFocus
                        style={{
                            backgroundColor: '#22c55e',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                    >
                        Join
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default JoinTableButton;