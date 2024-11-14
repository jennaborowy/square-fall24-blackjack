"use client";
import "../../globals.css"
import React, { useEffect, useRef, useState } from "react";
import "../managefriends/UserList.css";
import AllUsers from "@/app/lobby/manageusers/AllUsers";
import SelectedUser from "@/app/lobby/manageusers/SelectedUser";
import { useAuth } from "@/app/context/auth";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";


function ManageUsers() {
    const [userList, setUserList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

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
                >
                </SelectedUser>

            </div>
        </div>
    );
}

export default ManageUsers;