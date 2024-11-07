"use client";
import "../../globals.css"
import React, { useEffect, useRef, useState } from "react";
import "./UserList.css";
import FriendsList from "./FriendsList";
import UserList from "./UserList";
import { useAuth } from "@/app/context/auth";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

function ManageFriends() {
    const [userList, setUserList] = useState([]);
    const [friends, setFriends] = useState([]);

    const currentUser = useAuth().currentUser;

    // check for the username info stuff


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

                const friendIds = data.friends || [];

                // initializes user list to be without currentUser
                const initUserList = Object.values(data).filter((user) => user.uid !== currentUser.uid);
                setUserList(initUserList);
            }).catch((error) => {
                console.log("err in fetch: ", error.message);
            });

        } catch (error) {
            console.log(error.message);
        }
    }, [currentUser]);

    // Function to add a friend
    const handleAddFriend = async (userId) => {
        if (!currentUser) return;

        try {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                friends: arrayUnion(userId),
            });

            setFriends((prevFriends) => [...prevFriends, userId]);
            setUserList((prevUserList) => prevUserList.filter((user) => user.uid !== userId));
        } catch (error) {
            console.log("Error adding friend:", error);
        }
    };

    // Function to remove a friend
    const handleRemoveFriend = async (friendId) => {
        if (!currentUser) return;

        try {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                friends: arrayRemove(friendId),
            });

            setFriends((prevFriends) => prevFriends.filter((id) => id !== friendId));
            fetchUserData();  // Refresh both lists after removal
        } catch (error) {
            console.log("Error removing friend:", error);
        }
    };

    return (
        <div className="row">
            <div className="col">
                <UserList
                    userList={userList}
                    setUserList={setUserList}
                    //onFriendUpdate={onFriendUpdate}

                    // userList={userList}
                    // onAddFriend={handleAddFriend()}
                >
                </UserList>
            </div>
            <div className="col">
                <FriendsList
                    userList={userList}
                    setUserList={setUserList}
                    //onFriendUpdate={onFriendUpdate}

                    // friends={friends}
                    // onRemoveFriend={handleRemoveFriend}
                ></FriendsList>
            </div>
        </div>
    );
}

export default ManageFriends;