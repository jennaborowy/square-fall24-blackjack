import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/auth";
import { arrayRemove, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import "./UserList.css";

function FriendsList({ userList, setUserList }) {
    const [friends, setFriends] = useState([]);
    const [friend, setFriend] = useState(null);
    const [modalOn, setModalOn] = useState(false);

    const currentUser = useAuth().currentUser;

    // grabs friends to display when currentUser loads and when the userList updates
    useEffect(() => {
        async function getFriends() {
            if (!currentUser) {
                return;
            }
            const userRef = doc(collection(db, "users"), currentUser.uid);
            const docSnap = await getDoc(userRef);
            setFriends([...docSnap.data().friends]);
            console.log(docSnap.data().friends);
        }

        getFriends()
            .then((res) => console.log("res: ", res))
            .then((data) => console.log("data: ", data))
            .catch((error) => {console.log(error)});
    }, [currentUser, userList])

    // verifies current friend by uid
    async function updateFriend(uid) {
        const userRef = doc(db, "users", uid);
        const docSnap = await getDoc(userRef);

        setFriend(docSnap.data())
        setModalOn(true);
    }

    async function getFirstName(uid) {
        const userRef = doc(db, "users", uid);
        const docSnap = await getDoc(userRef);
        console.log("first: ", docSnap.data().firstName)
        return docSnap.data().firstName.toString();
    }

    async function getLastName(uid) {
        const userRef = doc(db, "users", uid);
        const docSnap = await getDoc(userRef);
        return docSnap.data().lastName.toString();
    }

    async function getUsername(uid) {
        const userRef = doc(db, "users", uid);
        const docSnap = await getDoc(userRef);
        return docSnap.data().username.toString();
    }

    // removes friend from currentUser's friend list
    async function removeFriend(user) {
        setModalOn(false);

        const userRef = doc(collection(db, "users"), currentUser.uid);
        try {
            const docRef = await updateDoc(userRef, {
                friends: arrayRemove(user.uid),
            });
            console.log("removed user: ", user.uid)
        } catch (error) {
            console.log("error removing friend: ", error);
        }
    }

    return (
        <div className="TableList-container mt-4 p-10 h-96 border rounded-lg overflow-y-auto shadow-md">
            <h1 className="text-center mt-3 mb-0">View Friends</h1>
            <div className="space-y-2 pt-1 p-4">
                {friends.map((uid, index) => (
                    <div>
                        <div
                            key={index}
                            className="p-4 mt-2 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50"
                        >
                            <div className="flex justify-between items-center row">
                                <div className="col" id={uid}>
                                    <h3 className="font-medium">@{getUsername(uid)}</h3>
                                    <p className="text-sm text-gray-600">{getFirstName(uid)} {getLastName(uid)}
                                    </p>
                                </div>
                                <div className="col">
                                    <div className="button-container">
                                        <button className="btn btn-danger mt-3" onClick={(e) => {
                                            updateFriend(uid)
                                                .then(() => console.log("updated"))
                                                .catch((error) => {
                                                    console.log(error);
                                                });

                                            setModalOn(true);
                                        }}>Remove Friend
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Dialog
                            open={modalOn}
                            onClose={(e) => setModalOn(false)}>
                            <DialogContent> {(friend != null) && (
                                <DialogContentText>
                                    Remove @{friend.username}?
                                </DialogContentText>
                            )}
                            </DialogContent>
                            <DialogActions>
                                <button className="mt-3 btn btn-danger border" onClick={(e) => removeFriend(friend)}>
                                    Yes
                                </button>
                                <button className="mt-3 btn border" onClick={(e) => setModalOn(false)}>
                                    No
                                </button>
                            </DialogActions>
                        </Dialog>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FriendsList;
