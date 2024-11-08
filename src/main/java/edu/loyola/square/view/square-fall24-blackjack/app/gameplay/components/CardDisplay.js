'use client'
import React, {useEffect, useState} from "react";
import Card from '../card';
import '../card.css'
import '../icons.css'
import '../gameinfo.css'
import AceModal from '../AceModal'
import GameInfo from '../GameInfo'
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import {FriendsIcon, MessageIcon, ContactAdminIcon} from '../icons';
import PlaceBetAnimation from '../BetTypeAnimation'
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc, deleteDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import ChatBox from "@/app/messages/chatbox/chatbox";
import {Dialog} from "@mui/material";


export default function CardDisplay({ tableId }) {
  const [playerHands, setPlayerHands] = useState({});
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, isGameOver] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [playerStand, setPlayerStand] = useState(false);
  const [gameStatusMessage, setGameStatusMessage] = useState("");
  const [showAceModal, setShowAceModal] = useState(false);
  const [betAmount, setBetAmount] = useState("");
  const [betError, setBetError] = useState("");
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isValidBet, setIsValidBet] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const openChat = () => setIsChatOpen(true);

  const [isAdminChatOpen, setIsAdminChatOpen] = useState(false);
  const openAdminChat = () => setIsAdminChatOpen(true);

  const MIN_BET = 0;
  const MAX_BET = 10000;
  const BET_INCREMENT = 5;

  useEffect(() => {
    console.log("Initial tableId:", tableId);
    if (!tableId) {
      console.log("No tableId on mount");
      const storedTableId = sessionStorage.getItem('gameTableId');
      if (storedTableId) {
        console.log("Found stored tableId:", storedTableId);
        // You might want to handle this case
      }
    }
  }, []);

  // Debug log for initial mount
  useEffect(() => {
    console.log("Component mounted with tableId:", tableId);
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log("Current players:", players);
    console.log("Current player hands:", playerHands);
    console.log("Current player index:", currentPlayerIndex);
    console.log("Current user ID:", auth?.currentUser?.uid);
  }, [players, playerHands, currentPlayerIndex]);

  useEffect(() => {
    const loadPlayers = async () => {
      console.log("Loading players with tableId:", tableId);
      if (!tableId) {
        console.error("No tableId provided");
        return;
      }

      try {
        const tableRef = doc(db, 'Table', tableId);
        const tableSnap = await getDoc(tableRef);

        console.log("Raw Firestore snapshot:", tableSnap);

        if (tableSnap.exists()) {
          const tableData = tableSnap.data();
          console.log("Table data loaded:", tableData);
          console.log("Raw table data:", tableData);
          console.log("Players from table:", tableData.players);

          if (tableData.players && Array.isArray(tableData.players) && tableData.players.length > 0) {
            // Set players first
            setPlayers([...tableData.players]);

            // Then initialize hands
            const initialHands = {};
            tableData.players.forEach(playerId => {
              initialHands[playerId] = [];
            });
            setPlayerHands({...initialHands});

            // Store tableId
            sessionStorage.setItem('gameTableId', tableId);

            console.log("Players set to:", tableData.players);
            console.log("Initial hands set to:", initialHands);
          } else {
            console.error("No players found in table data or invalid players array");
          }
        } else {
          console.error("Table document doesn't exist");
        }
      } catch (error) {
        console.error("Error loading players:", error);
      }
    };

    if (tableId) {
      console.log("Triggering loadPlayers with tableId:", tableId);
      loadPlayers();
    } else {
      console.log("No tableId available yet");
    }
  }, [tableId]);

  useEffect(() => {
    console.log("Players state updated:", players);
  }, [players]);

  const validateBet = async (betAmount) => {
    try {
      // Get table document reference
      const tableRef = doc(db, 'Table', tableId);
      const tableSnap = await getDoc(tableRef);

      if (!tableSnap.exists()) {
        setBetError("Could not validate bet: table not found");
        setIsValidBet(false);
        return false;
      }

      const tableData = tableSnap.data();
      const minimumBet = tableData.minimum_bet;

      const bet = parseFloat(betAmount);
      if (isNaN(bet)) {
        setBetError("Your bet should be a valid number!");
        setIsValidBet(false);
        return false;
      }
      if (bet < minimumBet) {
        setBetError(`You cannot bet less than $${minimumBet} at this table!`);
        setIsValidBet(false);
        return false;
      }
      if (bet > MAX_BET) {
        setBetError(`You cannot bet more than $${MAX_BET} at this table!`);
        setIsValidBet(false);
        return false;
      }
      if (bet % BET_INCREMENT !== 0) {
        setBetError(`Your bet must satisfy increments of $${BET_INCREMENT}`);
        setIsValidBet(false);
        return false;
      }
      setBetError("");
      setIsValidBet(true);
      return true;
    } catch (error) {
      console.error("Error validating bet:", error);
      setBetError("Error validating bet. Please try again.");
      setIsValidBet(false);
      return false;
    }
  };

  function endGame(gameState) {
    if (!gameState || !gameState.gameStatus) return;

    const status = gameState.gameStatus.endStatus;
    if (status !== "IN_PROGRESS") {
      isGameOver(true);
      setGameStatusMessage(gameState.gameStatus.endMessage);
    }
  }

  const handleLeaveTable = async () => {
    if (!tableId || !auth?.currentUser?.uid) {
      window.location.href = '/lobby';
      return;
    }

    try {
      const tableRef = doc(db, 'Table', tableId);

      await updateDoc(tableRef, {
        players: arrayRemove(auth.currentUser.uid)
      });

      const updatedTableSnap = await getDoc(tableRef);
      if (updatedTableSnap.exists()) {
        const tableData = updatedTableSnap.data();
        if (!tableData.players || tableData.players.length === 0) {
          await deleteDoc(tableRef);
        }
      }

      sessionStorage.removeItem('gameTableId');
      sessionStorage.removeItem('playerId');
      sessionStorage.removeItem('tableName');

      window.location.href = '/lobby';
    } catch (error) {
      window.location.href = '/lobby';
    }
  };

  const startGame = async () => {

    console.log("Start game triggered");
    console.log("Current players:", players);

    if (!players || players.length === 0) {
      console.error("No players available to start game");
      return;
    }

    console.log("Using tableId:", tableId);
    console.log("Starting game with players:", players);
    setGameStarted(true);

    try {
      const response = await fetch('http://localhost:8080/gamestart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          players,
          tableId,
          currentUserId: auth?.currentUser?.uid
        }),
      });

      console.log("Game start response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Connection failed: ${errorText}`);
      }

      const result = await response.json();
      console.log("Game start result:", result);

      if (result.players && result.players.length > 0) {
        const newPlayerHands = {};
        result.players.forEach((playerState, index) => {
          if (players[index]) {
            newPlayerHands[players[index]] = playerState.hand || [];
          }
        });
        console.log("Setting new player hands:", newPlayerHands);
        setPlayerHands(newPlayerHands);
        setDealerHand(result.dealerHand || []);
        setCurrentPlayerIndex(result.currentPlayerIndex || 0);
        setGameState(result);
      } else {
        console.error("No player data in game start result");
      }
    } catch (error) {
      console.error("Game failed to start", error);
    }
  };

  const playerHits = async () => {
    if (gameOver || auth?.currentUser?.uid !== players[currentPlayerIndex]) return;

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
      });

      if (!response.ok) throw new Error("Connection failed");
      const result = await response.json();

      const newPlayerHands = {...playerHands};
      result.players.forEach((playerState, index) => {
        if (players[index]) {
          newPlayerHands[players[index]] = playerState.hand || [];
        }
      });

      setPlayerHands(newPlayerHands);
      setDealerHand(result.dealerHand || []);
      setCurrentPlayerIndex(result.currentPlayerIndex || 0);
      setGameState(result);
      endGame(result);
    } catch (error) {
      console.log("Hit failed", error);
    }
  };

  const playerStands = async () => {
    if (gameOver || auth?.currentUser?.uid !== players[currentPlayerIndex]) return;

    try {
      const response = await fetch('http://localhost:8080/stand', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error("Connection failed");
      const result = await response.json();

      const newPlayerHands = {...playerHands};
      result.players.forEach((playerState, index) => {
        if (players[index]) {
          newPlayerHands[players[index]] = playerState.hand || [];
        }
      });

      setPlayerHands(newPlayerHands);
      setDealerHand(result.dealerHand || []);
      setCurrentPlayerIndex(result.currentPlayerIndex || 0);
      setPlayerStand(true);
      setGameState(result);
      endGame(result);
    } catch (error) {
      console.log("Stand failed", error);
    }
  };

  const promptAce = async (selectedValue) => {
    if (!gameStarted || !gameState || auth?.currentUser?.uid !== players[currentPlayerIndex]) return;

    try {
      const response = await fetch('http://localhost:8080/promptAce', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({aceValue: selectedValue}),
      });

      if (!response.ok) throw new Error("Connection failed");
      const result = await response.json();

      const newPlayerHands = {...playerHands};
      result.players.forEach((playerState, index) => {
        if (players[index]) {
          newPlayerHands[players[index]] = playerState.hand || [];
        }
      });

      setPlayerHands(newPlayerHands);
      setDealerHand(result.dealerHand || []);
      setCurrentPlayerIndex(result.currentPlayerIndex || 0);
      setGameState(result);
      setShowAceModal(false);
    } catch (error) {
      console.log("Prompt Ace failed", error);
    }
  };

  useEffect(() => {
    if (gameStarted && gameState && gameState.hasAce === true &&
        auth?.currentUser?.uid === players[currentPlayerIndex]) {
      setShowAceModal(true);
    }
  }, [gameState?.hasAce, currentPlayerIndex, players]);

  const handleAceValueSelect = (value) => {
    promptAce(value);
  };

  const handleBetPlaced = (betValue) => {
    const bet = betValue.target.value;
    if(validateBet(bet)) {
      setBetAmount(bet);
    }
  };

  const isCurrentPlayer = auth?.currentUser?.uid === players[currentPlayerIndex];

  const handleClickOpen = () => {
    setIsChatOpen(true);
  };

  const handleClose = () => {
    setIsChatOpen(false);
  };
  return (
      <div>
        <div className="cardDisplay">
          <div className="friend-icon">
            <FriendsIcon/>
          </div>

          {gameStarted && (
            <div className="leave-btn">
              <button className="mt-3 btn btn-danger" onClick={handleLeaveTable}>
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
                    aria-label="Amount (to the nearest dollar)"
                  />
                  <InputGroup.Text>.00</InputGroup.Text>
                </InputGroup>
              </div>
              <div className="start-container">
                <button
                  className="btn btn-lg btn-success"
                  onClick={startGame}
                  disabled={!isValidBet}
                >
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

          {gameStarted && isCurrentPlayer && !playerStand && !gameOver && (
            <div className="btn-container">
              <button className="action-btn" onClick={playerHits}>Hit</button>
              <button className="action-btn" onClick={playerStands}>Stand</button>
            </div>
          )}

          {gameStarted && (
            <div className="all-players-container">
              {Array.isArray(players) && players.length > 0 ? (
                players.map((playerId, index) => (
                  <div key={playerId}
                       className={`playerHand-container ${index === currentPlayerIndex ? 'active-player' : ''}`}>
                    {playerHands && playerHands[playerId] && Array.isArray(playerHands[playerId]) ? (
                      playerHands[playerId].map((card, cardIndex) => (
                        <Card key={cardIndex} suit={card.suit} rank={card.rank}/>
                      ))
                    ) : (
                      <div>Waiting for cards...</div>
                    )}
                  </div>
                ))
              ) : (
                <div>Loading players...</div>
              )}
            </div>
          )}

          {gameStarted && (
            <div className="bet-value">
              {betAmount}
            </div>
          )}
          <div className="message-icon">
            <div className="icons-btn" onClick={handleClickOpen}>
              <MessageIcon/>
                {isChatOpen && <ChatBox onClose={handleClose}/>}
            </div>
          </div>
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