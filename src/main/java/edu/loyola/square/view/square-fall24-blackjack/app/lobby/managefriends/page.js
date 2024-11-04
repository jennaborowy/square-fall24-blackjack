"use client";
import "../../globals.css"
import React, { useEffect, useRef, useState } from "react";
import "./UserList.css";
import FriendsList from "./FriendsList";
import UserList from "@/app/lobby/managefriends/UserList";

function ManageFriends() {
    const [userList, setUserList] = useState([]);

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
                setUserList(Object.values(data));
            }).catch((error) => {
                console.log("err in fetch: ", error.message);
            });

        } catch (error) {
            console.log(error.message);
        }
    }, []);

    return (
        <div className="row">
            <div className="col">
                <UserList
                    userList={userList}
                    setUserList={setUserList}>
                </UserList>
            </div>
            <div className="col">
                <FriendsList
                    userList={userList}
                    setUserList={setUserList}
                ></FriendsList>
            </div>
        </div>
    );
}

export default ManageFriends;