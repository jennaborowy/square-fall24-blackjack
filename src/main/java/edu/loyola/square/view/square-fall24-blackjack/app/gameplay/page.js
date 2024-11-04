'use client'
import React, {useState, useEffect} from "react";
import Card from './card';
import './card.css'
import './icons.css'
import './gameinfo.css'
import AceModal from './AceModal'
import GameInfo from './GameInfo'
import BetInput from './PlaceBet'
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import {FriendsIcon, MessageIcon } from './icons';
import PlaceBetAnimation from './BetTypeAnimation'
import ChatBox from "../messages/chatbox/chatbox";
import {CometChatConversationsWithMessages} from "@cometchat/chat-uikit-react";
import CometChat from "@/app/messages/cometChatUiInit";


export default function CardDisplay() {
  //going to be list of cards
  const [playerHand, setPlayerHand] = useState([])
  const [dealerHand, setDealerHand] = useState([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, isGameOver] = useState(false)
  const [gameState, setGameState] = useState(null)
  const [playerStand, setPlayerStand] = useState(false)
  const [gameStatusMessage, setGameStatusMessage] = useState("")
  //const [gameStatus, setGameStatus] = useState([])
  const [showAceModal, setShowAceModal] = useState(false)
  const [betAmount, setBetAmount] = useState("")
  const [betError, setBetError] = useState("")

  const [isChatOpen, setIsChatOpen] = useState(false);
  const openChat = () => setIsChatOpen(true);
  const MIN_BET = 0; //will be changed when getting table
  const MAX_BET = 10000;
  const BET_INCREMENT = 5;

  const validateBet = async (betAmount) => {
    const bet = parseFloat(betAmount)
    if (isNaN(bet))
    {
      setBetError("Your bet should be a valid number!")
      return false
    }
    else if(bet < MIN_BET)
    {
      setBetError("You cannot bet less than $ ${MIN_BET} at this table!")
      return false
    }
    else if(bet > MAX_BET)
    {
      setBetError("You cannot bet more than $ ${MAX_BET} at this table!")
      return false
    }
    else if (bet % BET_INCREMENT !== 0)
    {
      setBetError("Your bet must satisfy increments of $ ${BET_INCREMENT}")
      return false
    }
    else
    {
      //valid bet
      setBetError("")
      return true;
    }
  }

  function endGame(gameState) {
    if (!gameState || !gameState.gameStatus) {
      console.log("dont have game state")
      return;
    }
    const status = gameState.gameStatus.endStatus;
    if (status !== gameState.gameStatus.IN_PLAY) {
      console.log("game should end")
      isGameOver(true);
      setGameStatusMessage(gameState.gameStatus.endMessage);
    }
  };

  const localhost = "http://localhost:8080";
  const startGame = async () => {
    console.log("fetching game...");
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
    console.log("Player length", playerHand.length);
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
      console.log("Player response ", result)
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
      console.log("Player response ", result)
      setPlayerHand(result.playerHand);
      setDealerHand(result.dealerHand);
      setPlayerStand(true);
      setGameState(result)
      endGame(result)

    } catch (error) {
      console.log("Stand failed", error)
    }

  };

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
      console.log("Player response ", result)
      setPlayerHand(result.playerHand);
      setDealerHand(result.dealerHand);
      setGameState(result)
      setShowAceModal(false);

    } catch (error) {
      console.log("Prompt Ace failed", error)
    }
  };

  useEffect(() => {
    if (gameStarted && gameState && gameState.hasAce  === true) {
      setShowAceModal(true);
    }
  }, [gameState?.hasAce]);

  const handleAceValueSelect = (value) => {
    promptAce(value);
  };

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
            <a href="/lobby" className="mt-3 btn btn-danger" role="button">Leave Game</a>
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
                      onClick={startGame}> {/*disabled={!betAmount || !!betError}> */}
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
          </div>)}
        {gameOver && (
          <div className="end-container">
            {gameStatusMessage}
          </div>
        )}
        {gameStarted && !playerStand && !gameOver && (
          <div className="btn-container">
            {/*<button type="button" class="btn action-btn" onClick={playerHits}>Hit</button>*/}
            <button className="action-btn" onClick={playerHits}>Hit</button>
            <button className="action-btn" onClick={playerStands}>Stand</button>
          </div>)}

        {gameStarted && (
          <div className="playerHand-container">
            {playerHand.map((card, index) => (
              <Card key={index} suit={card.suit} rank={card.rank}/>))}
          </div>)}
        {gameStarted && (
          <div className="bet-value">
            {betAmount}
          </div>)}
        <div className="message-icon">
          <div className="icons-btn" onClick={openChat}>
            <MessageIcon/>
            {isChatOpen && <ChatBox />}
          </div>
        </div>
        {gameStarted && (
          <div className="game-stats-container">
            <GameInfo/>
          </div>)}

        <AceModal
          showModal={showAceModal}
          onSelectValue={handleAceValueSelect}
        />
      </div>
    </div>
  );
}
