'use client'
import React, { useState, useEffect, useRef, useContext } from 'react';
import './chat.css';
import { db } from "@/firebaseConfig";
import {arrayUnion, doc, getDoc, onSnapshot, updateDoc, serverTimestamp} from "firebase/firestore";
import { AuthContext } from "@/app/messages/AuthContext";
import { ChatContext } from "@/app/messages/ChatContext";

export default function Chat() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const endRef = useRef(null);
  const { currentUser } = useContext(AuthContext);
  const { data, dispatch } = useContext(ChatContext);

  // Enables scrolling to view all messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for messages
  useEffect(() => {
    if (!data.conversationId) return;

    const unsubscribe = onSnapshot(
      doc(db, "conversations", data.conversationId),
      (doc) => {
        if (doc.exists()) {
          setMessages(doc.data().messages || []);
        }
      },
      (error) => {
        console.error("Error listening to messages:", error);
      }
    );
    return () => unsubscribe();
  }, [data.conversationId]);

  const handleSend = async () => {
    if (!text.trim() || !data.conversationId) return;

    try {
      const conversationRef = doc(db, "conversations", data.conversationId);
      const conversationDoc = await getDoc(conversationRef);

      if (!conversationDoc.exists()) {
        console.error("Conversation doesn't exist");
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
      await updateDoc(conversationRef, {
        messages: arrayUnion(newMessage),
        lastUpdate: serverTimestamp()
      });

      //updates the latest message sent
      const participants = conversationDoc.data().participants;
      for (const userId of participants) {
        const userChatsRef = doc(db, "userChats", userId);
        const userChatsDoc = await getDoc(userChatsRef);
        if (userChatsDoc.exists()) {
          const userChats = userChatsDoc.data().chats;
          const chatIndex = userChats.findIndex(chat => chat.chatId === data.conversationId);
          if (chatIndex !== -1) {
            userChats[chatIndex] = {
              ...userChats[chatIndex],
              lastMessage: text.trim(),
              updatedAt: Date.now(),
              isSeen: userId === currentUser.uid
            };
            await updateDoc(userChatsRef, { chats: userChats });
          }
        }
      }
      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // sets empty state if no active chat
  if (!data.conversationId  ) {
    return (
      <div className="chat">
        <div className="no-chat-selected">
          <p>Select a chat or start a new conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <div className="texts">
            <span>{data.user?.username}</span>
            <p>Online</p>
          </div>
        </div>
      </div>

      <div className="center">
        {messages.map((message) => (
          //set the message class to 'message own' if sender is current user id, or just 'message' class if the recipient
          <div key={message.id} className={`message ${message.senderId === currentUser.uid ? 'own' : ''}`}>
            <div className="texts">
              <p>{message.text}</p>
              <span>{formatTime(message.createdAt)}</span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="bottom">
        <div className="icons">
          <input type="text" placeholder="Type a message..." onChange={e => setText(e.target.value)}/>
          <button type="submit" className="sendButton" onClick={handleSend} disabled={!text.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}