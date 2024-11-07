import './addUser.css'
import Form from "react-bootstrap/Form";
import { auth, db } from '@/firebaseConfig'
import {useContext, useState} from "react";
import {doc, collection, query, where, getDocs, getDoc, updateDoc, setDoc, arrayUnion, serverTimestamp} from 'firebase/firestore';
import { AuthContext } from "@/app/messages/AuthContext";
import { ChatContext } from "@/app/messages/ChatContext";

export const AddUser = () => {
  const {currentUser} = useContext(AuthContext);
  const {dispatch} = useContext(ChatContext);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");

  //search for friends available to chat with
  const handleSearch = async (e) => {
    e.preventDefault();
    //get user name from search form
    const formData = new FormData(e.target);
    const username = formData.get("username");

    //searches users for inputted username
    try {
      const userRef = collection(db, "users");
      const friendUsernameQuery = query(userRef, where("username", "==", username));
      const friendSnapshot = await getDocs(friendUsernameQuery);
      if (friendSnapshot.empty) {
        console.log("No user found with that username.");
        return;
      }
      //gets the friend / recipients id to search user
      const friendDoc = friendSnapshot.docs[0];
      const friendId = friendDoc.id;
      const currentUserRef = doc(db, "users", currentUser.uid);
      const currentUserSnapshot = await getDoc(currentUserRef);

      //checks if the user is in the current user's friends list
      const currentUserData = currentUserSnapshot.data();
      const friendsList = currentUserData.friends || [];
      if (friendsList.includes(friendId)) {
        const foundUser = friendDoc.data();
        setUser({ ...foundUser, id: friendId });
      } else {
        console.log("This user is not in your friend list.");
        setUser(null);
      }
    } catch (error) {
      console.error("Error searching for user:", error);
      setUser(null);
    }
  };

  //add new chat with a specified user
  const handleAddChat = async (friend) => {
    if (!currentUser?.uid || !user?.uid) {
      console.error("Either currentUser or recipient user ID is undefined.");
      return;
    }
    try {
      setUser(friend);
      // Create sorted conversation ID
      const conversationId = [currentUser.uid, user.uid].sort().join('_');
      const conversationRef = doc(db, "conversations", conversationId);
      const conversationDoc = await getDoc(conversationRef);

      if (!conversationDoc.exists()) {
        // Create new conversation if it doesn't exist
        await setDoc(conversationRef, {
          conversationId,
          createdAt: serverTimestamp(),
          messages: [],
          participants: [currentUser.uid, user.uid],
          username: user.username,
          currentUser: currentUser.username,
        });
        // Update userChats for both users
        const chatData = {
          chatId: conversationId,
          lastMessage: "",
          receiverId: user.uid,
          receiverName: user.username,
          updatedAt: Date.now(),
        };
        const recipientChatData = {
          chatId: conversationId,
          lastMessage: "",
          receiverId: currentUser.uid,
          receiverName: currentUser.username,
          updatedAt: Date.now(),
        };
        // Update current user's chats
        const currentUserChatsRef = doc(db, "userChats", currentUser.uid);
        const currentUserDoc = await getDoc(currentUserChatsRef);

        if (!currentUserDoc.exists()) {
          await setDoc(currentUserChatsRef, { chats: [chatData] });
        } else {
          await updateDoc(currentUserChatsRef, {
            chats: arrayUnion(chatData)
          });
        }
        // Update recipient's chats
        const recipientChatsRef = doc(db, "userChats", user.uid);
        const recipientDoc = await getDoc(recipientChatsRef);

        if (!recipientDoc.exists()) {
          await setDoc(recipientChatsRef, { chats: [recipientChatData] });
        } else {
          await updateDoc(recipientChatsRef, {
            chats: arrayUnion(recipientChatData)
          });
        }
      }
      // Update ChatContext with the new conversation
      dispatch({type: "CHANGE_USER", payload: {user: user, chatId: conversationId, conversationId: conversationId}
      });

    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };
  return (
    <div className="addUser">
      <Form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">Search</button>
      </Form>
      {user && (
        <div className="user">
          <div className="detail">
            <span>{user.username}</span>
          </div>
          <button type="submit" onClick={handleAddChat}>
            Add User
          </button>
        </div>)}
      </div>
  )};


export default AddUser;