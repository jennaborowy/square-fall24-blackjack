"use client";
import "../../globals.css"
import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import "./UserList.css";
import { collection, doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { useAuth } from "@/app/context/auth";
import FriendsList from "./FriendsList";

function ManageFriends() {
    const [userList, setUserList] = useState([]);
    const [modalOn, setModalOn] = useState(false);
    const [friend, setFriend] = useState(null);
    const currentUser = useAuth().currentUser;

    //const userRef = useRef(null);

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
                // console.log(friendList);
                // console.log(data);
            }).catch((error) => {
                console.log("err in fetch: ", error.message);
            });


        } catch (error) {
            console.log(error.message);
        }
    }, []);

    useEffect(() => {
        // when userList updates, update the view
        console.log(userList);
    }, [userList]);

    // searches for potential friend by uid
    async function updateFriend(user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        console.log("donSnap.data(): ", docSnap.data())
        setFriend(docSnap.data())
        console.log("uid: ", docSnap.data().uid)
        setModalOn(true);

    }

    // adds friend to currentUser's friend list
    async function addFriend(user) {
        setModalOn(false);

        const userRef = doc(collection(db, "users"), currentUser.uid);
        await updateDoc(userRef, {
            friends: arrayUnion(user.uid),
        })
        .then(() => console.log("added user: ", user.username))
        .then(() => console.log("really added lol"))
        .catch((error) => {
            console.log(error)
        });
    }

    return (
        <div className="row">
            <div className="TableList-container mt-4 p-10 h-96 border rounded-lg overflow-y-auto shadow-md col">
                <h1 className="text-center mt-3 mb-0">Find Friends</h1>
                <div className="space-y-2 pt-1 p-4">
                    {userList.map((user, index) => (// check that user is not in currentUser.friends
                        <div>
                            <div
                                key={index}
                                className="p-4 mt-2 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50"
                            >
                                <div className="flex justify-between items-center row">
                                    <div className="col" id={user.uid}>
                                        <h3 className="font-medium">@{user.username}</h3>
                                        <p className="text-sm text-gray-600">{user.firstName + " " + user.lastName}
                                        </p>
                                    </div>
                                    <div className="col">
                                        <div className="button-container">
                                            <button className="btn btn-success mt-3" onClick={(e) => {
                                                updateFriend(user)
                                                    .then(() => console.log("updated"))
                                                    .catch((error) => {
                                                        console.log(error);
                                                    });

                                                setModalOn(true);
                                            }}>Add Friend</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Dialog
                                open={modalOn}
                                onClose={(e) => setModalOn(false)}>
                                <DialogContent> {(friend != null) && (
                                    <DialogContentText>
                                        Add @{friend.username}?
                                    </DialogContentText>
                                )}
                                </DialogContent>
                                <DialogActions>
                                    <button className="mt-3 btn btn-success border" onClick={(e) => addFriend(friend)}>
                                        Yes
                                    </button>
                                    <button className="mt-3 btn btn-danger border" onClick={(e) => setModalOn(false)}>
                                        No
                                    </button>
                                </DialogActions>
                            </Dialog>
                        </div>
                    ))}
                </div>
            </div>
            <div className="col">
                <FriendsList children={currentUser}></FriendsList>
            </div>
        </div>
    );

}

export default ManageFriends;