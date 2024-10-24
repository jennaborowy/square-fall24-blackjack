'use client'
import {useState, useEffect} from "react";
import Card from './card';
import './card.css'
export default function CardDisplay() {
  //going to be list of cards
  const [playerHand, setPlayerHand] = useState([])
  const [dealerHand, setDealerHand] = useState([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, isGameOver] = useState(false)
  const [gameState, setGameState] = useState(null)
  const [playerStand, setPlayerStand] = useState(false)


  const localhost = "http://localhost:8080";
  const startGame = async () => {
    console.log("fetching game...");
    setGameStarted(true);

    try {
        const response = await fetch('http://localhost:8080/gamestart', {
          method: 'POST',
          headers:{
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({}),
          })
        if (!response.ok) throw new Error("Connection failed");
        const result = await response.json();
        setPlayerHand(result.playerHand);
        setDealerHand(result.dealerHand);
        setGameState(result)
      } catch (error){
        console.log("Game failed to start", error);
      }

    }

    const playerHits = async() => {
      console.log("Player length", playerHand.length);
      if (playerHand.length === 0) {
        console.log("Game has not started yet.");
        return;
      }
      try {
        const response = await fetch('http://localhost:8080/hit', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({}),
        })
        if (!response.ok) throw new Error("Connection failed");
        const result = await response.json();
        console.log("Player response ", result)
        setPlayerHand(result.playerHand);
        setDealerHand(result.dealerHand);
        setGameState(result)

      } catch (error) {
        console.log("Hit failed", error)
      }
    }
  const playerStands = async() => {
    if (playerHand.length === 0) {
      console.log("Game has not started yet.");
      return; // Prevent hitting if the game has not started
    }
    try {
      const response = await fetch('http://localhost:8080/stand', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',

        },
        credentials: 'include',
        body: JSON.stringify({}),
      })
      if (!response.ok) throw new Error("Connection failed");
      const result = await response.json();
      console.log("Player response ", result)
      setPlayerHand(result.playerHand);
      setDealerHand(result.dealerHand);
      setPlayerStand(true);
      setGameState(result)

    } catch (error) {
      console.log("Hit failed", error)
    }

  };

  return (
    <div>
      <div className="cardDisplay">
        {!gameStarted && (
          <div className="play-container">
            <button className="play-btn" onClick={startGame}>
              Start Game
            </button>
          </div>
        )}
        {gameStarted && (
        <div className="dealerHand-container">
          {dealerHand.map((card, index) => (
            <Card key={index} suit={card.suit} rank={card.rank} />
          ))}
        </div> )}

        {gameStarted && !playerStand && (
          <div className="btn-container">
          <button className="action-btn" onClick={playerHits}>Hit</button>
          <button className="action-btn" onClick={playerStands}>Stand</button>
        </div> )}

        {gameStarted && (
          <div className= "playerHand-container">
          {playerHand.map((card, index) => (
              <Card key={index} suit={card.suit} rank={card.rank} />
            ))}
        </div> )}
      </div>
    </div>
    );
}
