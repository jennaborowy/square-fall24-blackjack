import React from 'react';
import Avatar from '@mui/material/Avatar';
import {MessageSquareText} from 'lucide-react'
import  './icons.css'
import {ContactRound} from 'lucide-react'
export const FriendsIcon = ({ icon }) => {
  return (
    <Avatar sx={{bgcolor: '#B8860BFF', boxShadow: 1, border: 3, borderColor: 'black'}}>
      <ContactRound></ContactRound>
    </Avatar>
  );
};

export const MessageIcon = ({icon}) => {
  return (
    <Avatar sx={{bgcolor: '#B8860BFF', boxShadow: 1, border: 3, borderColor: 'black'}}>
      <MessageSquareText></MessageSquareText>
    </Avatar>
  );
}