//need to access table in db, participants, and automatically create table chat when table is created
//if players are added to table, they need to be added to chat -> use effect
//closing the chat

import React, { useState, useEffect, useRef, useContext } from 'react';
import '../chat/chat.css';
import '../chatbox/chatbox.css';

import {auth, db} from "@/firebaseConfig";
import {arrayUnion, doc, getDoc, onSnapshot, updateDoc, serverTimestamp, setDoc, collection, query} from "firebase/firestore";
import {AuthContext} from "@/app/messages/AuthContext";
import {ChatContext} from "@/app/messages/ChatContext";
import List from "@/app/messages/list/list";
import Chat from "@/app/messages/chat/chat";
import {orderBy} from "firebase-mock/src/lodash";
import {onAuthStateChanged} from "firebase/auth";

export default function TableChat({db, tableId, onClose}) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState("");
  const endRef = useRef(null);
  //const { currentUser } = useContext(AuthContext);
  //const { data, dispatch } = useContext(ChatContext);

  //trouble with auth context, alternate way to authenticate user
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const tableRef = doc(db, "Table", tableId);
    const unsubscribe = onSnapshot(tableRef, (doc) => {
      if (doc.exists()) {
        const tableData = doc.data();
        setMessages(tableData.messages || []);
      }
    });

    return () => unsubscribe();
  }, [tableId, currentUser]);

  const handleSendMessage = async () => {
    if (!text.trim() || !tableId) return;

    try {
      const tableRef = doc(db, "Table", tableId);
      const tableDoc = await getDoc(tableRef);

      if (!tableDoc.exists()) {
        console.error("Table doesn't exist");
        return;
      }

      //create a new message
      const newMessage = {
        id: crypto.randomUUID(),
        senderId: currentUser.uid,
        text: text.trim(),
        createdAt: new Date().toISOString()
      };

      //update conversation document with new message
      await updateDoc(tableRef, {
        messages: arrayUnion(newMessage),
        lastUpdate: serverTimestamp()
      });
      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return(
    <div className="chat-box" onClick={(e) => e.stopPropagation()}>
      <div className="chat-header">
        Table Name
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="center">
        {messages.map((message) => (
          //set the message class to 'message own' if sender is current user id, or just 'message' class if the recipient
          <div key={message.id} className={`message ${message.senderId === currentUser.uid ? 'own' : ''}`}>
            <div className="texts">
              <p>{message.text}</p>
              <span>{message.username}
              {formatTime(message.createdAt)}</span>
            </div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>

      <div className="bottom">
        <div className="icons">
          <input type="text" placeholder="Type a message..." value={text} onChange={e => setText(e.target.value)}/>
          <button type="submit" className="sendButton" onClick={handleSendMessage} disabled={!text.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}