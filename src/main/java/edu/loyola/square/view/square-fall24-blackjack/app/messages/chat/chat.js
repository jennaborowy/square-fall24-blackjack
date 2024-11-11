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
  const [user, setUser] = useState("");
  const endRef = useRef(null);
  const { currentUser } = useContext(AuthContext);
  const { data, dispatch } = useContext(ChatContext);

  // Enables scrolling to view all messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for messages
  //CHECK THIS OUT - Callie
  //This code successfully sends messages back and forth between two people by getting the participants's uid to designate a sender and receiver.
  //The fetchConversation function gets a snapshot of entire conversation stored in the database to show it in the chat box.
  //The CSS below creates a the 'chat' portion of the chatbox where the user can view the messages being sent.
  useEffect(() => {
    if (!data.conversationId) return;

    const fetchConversation = async () => {
      try {
        const conversationRef = doc(db, "conversations", data.conversationId);
        const conversationDoc = await getDoc(conversationRef);
        if (conversationDoc.exists()) {
          const conversationData = conversationDoc.data();
          setMessages(conversationData.messages || []);

          const participants = data.conversationId.participants;
          const receiverId = participants.find(id => id !== currentUser.uid);
          if (receiverId) {
            const receiverRef = doc(db, "users", receiverId);
            const receiverDoc = await getDoc(receiverRef);
            if (receiverDoc.exists()) {
              console.log("Receiver Document Data:", receiverDoc.data());
              setUser({ ...receiverDoc.data(), id: receiverDoc.id }); // Set the user state to the receiver data
            }
          }
        }
      } catch (error) {
        console.error("Error fetching conversation or receiver:", error);
      }
    };
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
    fetchConversation();
    return () => unsubscribe();
  }, [data.conversationId], currentUser);


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
     // const receiver = participants.find((participant) => participant !== currentUser.uid);

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

            <p>{console.log("user is", user.username)}Online</p>
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
          <input type="text" placeholder="Type a message..." value={text} onChange={e => setText(e.target.value)}/>
          <button type="submit" className="sendButton" onClick={handleSend} disabled={!text.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}