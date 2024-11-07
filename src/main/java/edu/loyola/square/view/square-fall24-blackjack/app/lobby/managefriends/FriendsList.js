import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/auth";
import { arrayRemove, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import "./UserList.css";

function FriendsList({ userList, setUserList }) {
    const [detailedFriends, setDetailedFriends] = useState([]);
    const [friendToRemove, setFriendToRemove] = useState(null);
    const [modalOn, setModalOn] = useState(false);

    const currentUser = useAuth().currentUser;

    // grabs friends to display when currentUser loads and when the userList updates
    useEffect(() => {
        async function getFriends() {
            if (!currentUser) return;

            const userRef = doc(collection(db, "users"), currentUser.uid);
            const docSnap = await getDoc(userRef);

            if (!docSnap.exists()) {
                console.log("doc doesn't exist for current user");
                setDetailedFriends([]);
                return;
            }
            const friendUids = docSnap.data().friends || [];

            const friendsData = await Promise.all(
                friendUids.map(async (uid) => {
                    const friendRef = doc(db, "users", uid);
                    const friendSnap = await getDoc(friendRef);
                    return {uid, ...friendSnap.data()}
                })
            );

            setDetailedFriends(friendsData);
        }

        getFriends().catch((error) => {console.log(error)});
    }, [currentUser, userList])

    // verifies current friend by uid
    async function updateFriend(user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        setFriendToRemove(docSnap.data())
        setModalOn(true);
    }

    // removes friend from currentUser's friend list
    async function removeFriend(user) {
        setModalOn(false);

        const userRef = doc(collection(db, "users"), currentUser.uid);
        try {
            await updateDoc(userRef, {
                friends: arrayRemove(user.uid),
            });
            //const docSnap = await getDoc(userRef);
            setDetailedFriends((prevFriends) => prevFriends.filter((f) => f.uid !== user.uid));
            setUserList([...userList, user]);
           // onFriendUpdate();
            console.log("removed user: ", user)
        } catch (error) {
            console.log("error removing friend: ", error);
        }
    }

    useEffect(() => {
        const updatedList = userList.filter((user) => !detailedFriends.includes(user.uid));
        if (JSON.stringify(updatedList) !== JSON.stringify(userList)) {
            setUserList(updatedList);
        }
    }, [detailedFriends])


    return (
        <div>
            <h1 className="UserList-header p-2 pt-3 rounded-top mt-3 mb-0">View Current Friends</h1>
            <div className="UserList-container p-10 h-96 rounded-bottom overflow-y-auto shadow-md">
                <div className="space-y-2 pt-1 p-4">
                    {detailedFriends.map((friend) => (
                        <div
                            key={friend.uid}
                            className="p-4 mt-2 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50"
                        >
                            <div className="flex justify-between items-center row">
                                <div className="col text-start" id={friend.uid}>
                                    <h3 className="font-medium">@{friend.username}</h3>
                                    <p className="text-sm text-gray-600">{friend.firstName} {friend.lastName}
                                    </p>
                                </div>
                                <div className="col text-end">
                                    <button className="btn btn-danger mt-3" onClick={(e) => {
                                        updateFriend(friend)
                                            .then(() => setModalOn(true))
                                            .catch((error) => {
                                                console.log(error);
                                            });
                                    }}>Remove Friend
                                    </button>
                                </div>
                            </div>

                        </div>
                    ))}
                    <Dialog
                        open={modalOn}
                        onClose={(e) => setModalOn(false)}>
                        <DialogContent> {(friendToRemove != null) && (
                            <DialogContentText>
                                Remove @{friendToRemove.username}?
                            </DialogContentText>
                        )}
                        </DialogContent>
                        <DialogActions>
                            <button className="mt-3 btn btn-danger border" onClick={(e) => removeFriend(friendToRemove)}>
                                Yes
                            </button>
                            <button className="mt-3 btn border" onClick={(e) => setModalOn(false)}>
                                No
                            </button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}

export default FriendsList;
