import './addUser.css'
import Form from "react-bootstrap/Form";
import { auth, db } from '@/firebaseConfig'
import { useContext, useState } from "react";
import {doc, collection, query, where, getDocs, getDoc, updateDoc, setDoc, arrayUnion, serverTimestamp} from 'firebase/firestore';
import { AuthContext } from "@/app/messages/AuthContext";
import { ChatContext } from "@/app/messages/ChatContext";

export const AddUser = () => {
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");

  //search for a user to create a conversation. Should become add a friend
  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const foundUser = querySnapshot.docs[0].data();
        setUser({ ...foundUser, id: querySnapshot.docs[0].id });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error searching for user:", err);
      setUser(null);
    }
  };

  //add new chat with a specified user
  const handleAddChat = async () => {
    if (!currentUser?.uid || !user?.uid) {
      console.error("Either currentUser or recipient user ID is undefined.");
      return;
    }
    try {
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
        </div>
      )}
    </div>
  );
};

export default AddUser;