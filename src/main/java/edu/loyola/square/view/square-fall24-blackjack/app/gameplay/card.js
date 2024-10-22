import React from 'react';
import './card.css'

const Card = ({ suit, rank }) => {
    const rankCode = rank === '10' ? '0' : rank;
    const imageUrl = `https://deckofcardsapi.com/static/img/${rankCode}${suit[0]}.png`;
    return (

          <div className="cardArea">
            <img src={imageUrl} alt={`${rank} of ${suit}`}/>
            <p>{rank} of {suit}</p>
          </div>

    );

};

export default Card;
