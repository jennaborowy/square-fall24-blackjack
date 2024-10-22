import React from 'react';
import Card from './card';
import './card.css'
export default function CardDisplay() {

  return (
    <div>
      <div className="cardDisplay">
        <h1>Card Display</h1>
        <div className="dealerHand-container">
        <Card suit="Hearts" rank="A" />
        <Card suit="Spades" rank="10" />
        </div>
        <div className= "playerHand-container">
        <Card suit="Clubs" rank="Q" />
        <Card suit="Diamonds" rank="K" />
          <Card suit="Spades" rank="3" />
        </div>
      </div>
    </div>
    );
}
