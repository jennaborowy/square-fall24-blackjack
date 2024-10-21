import React from 'react';
import Card from './card';

export default function CardDisplay() {

  return (
    <div>
      <h1>Card Display</h1>
      <Card suit="Hearts" rank="A" />
      <Card suit="Spades" rank="10" />
      <Card suit="Clubs" rank="Q" />
      <Card suit="Diamonds" rank="K" />
    </div>
    );
}
