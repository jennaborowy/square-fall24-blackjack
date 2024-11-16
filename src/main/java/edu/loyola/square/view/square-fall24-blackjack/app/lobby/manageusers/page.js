"use client";
import "../../globals.css"
import React, { useEffect, useState } from "react";
import "../managefriends/UserList.css";
import AllUsers from "@/app/lobby/manageusers/AllUsers";
import SelectedUser from "@/app/lobby/manageusers/SelectedUser";
import { useAuth } from "@/app/context/auth";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";


function ManageUsers() {
    const [userList, setUserList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [err, setErr] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const currentUser = useAuth().currentUser;

    // gets all users
    useEffect(() => {
        try {
            fetch('http://localhost:8080/api/user/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then((response) => response.json()
            ).then((data) => {
                if (!currentUser) return;

                const initUserList = Object.values(data);
                setUserList(initUserList);
            }).catch((error) => {
                console.log("err in fetch: ", error.message);
            });

        } catch (error) {
            console.log(error.message);
        }
    }, [currentUser]);

    return (
        <div className="row">
            <div className="col">
                <AllUsers
                    userList={userList}
                    setSelectedUser={setSelectedUser}
                >
                </AllUsers>
            </div>
            <div className="col">
                <SelectedUser
                    userInfo={selectedUser}
                    setErr={setErr}
                    setErrMsg={setErrMsg}
                    setSuccess={setSuccess}
                    setSuccessMsg={setSuccessMsg}
                >
                </SelectedUser>

            </div>
            <Dialog
                onClose={(e) => {
                    err ? setErr(false) : setSuccess(true)
                }}
                open={err || success}
            >
                <DialogTitle id="alert-dialog-title">
                    {err ? "Error" : "Success"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {err ? errMsg : successMsg}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <button
                        className="btn btn-light border"
                        onClick={(e) => {
                            setErr(false);
                            setSuccess(false);
                        }}
                    >Exit</button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ManageUsers;