import React from 'react';


const Card = ({ suit, rank }) => {
    const rankCode = rank === '10' ? '0' : rank;
    const imageUrl = `https://deckofcardsapi.com/static/img/${rankCode}${suit[0]}.png`;
    return (
        <div className="card">
          <div className="card-size">
            <img src={imageUrl} alt={`${rank} of ${suit}`} />
            <p>{rank} of {suit}</p>
          </div>
        </div>
    );

};

export default Card;
