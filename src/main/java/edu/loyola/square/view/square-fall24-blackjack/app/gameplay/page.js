'use client'
import React, {useEffect, useState} from "react";
import Card from './card';
import './card.css'
import './icons.css'
import './gameinfo.css'
import AceModal from './AceModal'
import GameInfo from './GameInfo'
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import {FriendsIcon} from './icons';
import PlaceBetAnimation from './BetTypeAnimation'
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc, deleteDoc, updateDoc, arrayRemove } from 'firebase/firestore';

export default function CardDisplay() {
  const [playerHand, setPlayerHand] = useState([])
  const [dealerHand, setDealerHand] = useState([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, isGameOver] = useState(false)
  const [gameState, setGameState] = useState(null)
  const [playerStand, setPlayerStand] = useState(false)
  const [gameStatusMessage, setGameStatusMessage] = useState("")
  const [showAceModal, setShowAceModal] = useState(false)
  const [betAmount, setBetAmount] = useState("")
  const [betError, setBetError] = useState("")

  const MIN_BET = 0;
  const MAX_BET = 10000;
  const BET_INCREMENT = 5;

  const validateBet = async (betAmount) => {
    const bet = parseFloat(betAmount)
    if (isNaN(bet)) {
      setBetError("Your bet should be a valid number!")
      return false
    }
    else if(bet < MIN_BET) {
      setBetError(`You cannot bet less than $${MIN_BET} at this table!`)
      return false
    }
    else if(bet > MAX_BET) {
      setBetError(`You cannot bet more than $${MAX_BET} at this table!`)
      return false
    }
    else if (bet % BET_INCREMENT !== 0) {
      setBetError(`Your bet must satisfy increments of $${BET_INCREMENT}`)
      return false
    }
    else {
      setBetError("")
      return true;
    }
  }

  function endGame(gameState) {
    if (!gameState || !gameState.gameStatus) {
      return;
    }
    const status = gameState.gameStatus.endStatus;
    if (status !== gameState.gameStatus.IN_PLAY) {
      isGameOver(true);
      setGameStatusMessage(gameState.gameStatus.endMessage);
    }
  }

  const handleLeaveTable = async () => {
    const tableId = sessionStorage.getItem('gameTableId');
    const userId = auth?.currentUser?.uid;

    if (!tableId || !userId) {
      window.location.href = '/lobby';
      return;
    }

    try {
      const tableRef = doc(db, 'Table', tableId);

      // Remove the player
      await updateDoc(tableRef, {
        players: arrayRemove(userId)
      });

      // Check if table is empty and delete if so
      const updatedTableSnap = await getDoc(tableRef);
      if (updatedTableSnap.exists()) {
        const tableData = updatedTableSnap.data();
        if (!tableData.players || tableData.players.length === 0) {
          await deleteDoc(tableRef);
        }
      }

      // Clear session storage
      sessionStorage.removeItem('gameTableId');
      sessionStorage.removeItem('playerId');
      sessionStorage.removeItem('tableName');

      window.location.href = '/lobby';
    } catch (error) {
      window.location.href = '/lobby';
    }
  };

  const startGame = async () => {
    setGameStarted(true);

    try {
      const response = await fetch('http://localhost:8080/gamestart', {
        method: 'POST',
        headers: {
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
      setGameStarted(true);
      endGame(result);

    } catch (error) {
      console.log("Game failed to start", error);
    }
  }

  const playerHits = async () => {
    if (gameOver) {
      return;
    }
    try {
      const response = await fetch('http://localhost:8080/hit', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          hit: "true",
        }),
      })
      if (!response.ok) throw new Error("Connection failed");
      const result = await response.json();
      setPlayerHand(result.playerHand);
      setDealerHand(result.dealerHand);
      setGameState(result);
      endGame(result)
    } catch (error) {
      console.log("Hit failed", error)
    }
  }

  const playerStands = async () => {
    if (gameOver) {
      return;
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
      setPlayerHand(result.playerHand);
      setDealerHand(result.dealerHand);
      setPlayerStand(true);
      setGameState(result)
      endGame(result)

    } catch (error) {
      console.log("Stand failed", error)
    }
  }

  const promptAce = async (selectedValue) => {
    if (!gameStarted || !gameState) return;
    try {
      const response = await fetch('http://localhost:8080/promptAce', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({aceValue: selectedValue}),
      })
      if (!response.ok) throw new Error("Connection failed");
      const result = await response.json();
      setPlayerHand(result.playerHand);
      setDealerHand(result.dealerHand);
      setGameState(result)
      setShowAceModal(false);

    } catch (error) {
      console.log("Prompt Ace failed", error)
    }
  }

  useEffect(() => {
    if (gameStarted && gameState && gameState.hasAce === true) {
      setShowAceModal(true);
    }
  }, [gameState?.hasAce]);

  const handleAceValueSelect = (value) => {
    promptAce(value);
  }

  const handleBetPlaced = (betValue) => {
    const bet = betValue.target.value
    if(validateBet(bet)) {
      setBetAmount(bet)
    }
  }

  return (
      <div>
        <div className="cardDisplay">
          <div className="friend-icon">
            <FriendsIcon/>
          </div>
          {gameStarted && (
              <div className="leave-btn">
                <button
                    className="mt-3 btn btn-danger"
                    onClick={handleLeaveTable}
                >
                  Leave Game
                </button>
              </div>
          )}
          {!gameStarted && (
              <div className="bet-container">
                <div className="place-bet-title">
                  <div className="place-bet-content">
                    <PlaceBetAnimation>
                      Place Your Bet!
                    </PlaceBetAnimation>
                  </div>
                </div>
                <div className="bet-value">
                  <InputGroup className="mb-3">
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                        type="number"
                        min={MIN_BET}
                        max={MAX_BET}
                        step={BET_INCREMENT}
                        onChange={handleBetPlaced}
                        isInvalid={!!betError}
                        aria-label="Amount (to the nearest dollar)"/>
                    <InputGroup.Text>.00</InputGroup.Text>
                  </InputGroup>
                </div>
                <div className="start-container">
                  <button className="btn btn-lg btn-success"
                          onClick={startGame}>
                    Start Game
                  </button>
                </div>
              </div>
          )}
          {gameStarted && (
              <div className="dealerHand-container">
                {dealerHand.map((card, index) => (
                    <Card key={index} suit={card.suit} rank={card.rank}/>
                ))}
              </div>
          )}
          {gameOver && (
              <div className="end-container">
                {gameStatusMessage}
              </div>
          )}
          {gameStarted && !playerStand && !gameOver && (
              <div className="btn-container">
                <button className="action-btn" onClick={playerHits}>Hit</button>
                <button className="action-btn" onClick={playerStands}>Stand</button>
              </div>
          )}
          {gameStarted && (
              <div className="playerHand-container">
                {playerHand.map((card, index) => (
                    <Card key={index} suit={card.suit} rank={card.rank}/>
                ))}
              </div>
          )}
          {gameStarted && (
              <div className="bet-value">
                {betAmount}
              </div>
          )}
          {gameStarted && (
              <div className="game-stats-container">
                <GameInfo/>
              </div>
          )}
          <AceModal
              showModal={showAceModal}
              onSelectValue={handleAceValueSelect}
          />
        </div>
      </div>
  );
}