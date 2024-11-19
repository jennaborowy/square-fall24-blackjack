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
import {FriendsIcon, MessageIcon} from '../icons';
import PlaceBetAnimation from '../BetTypeAnimation'
import { auth, db } from "@/firebaseConfig";
import {doc, getDoc, deleteDoc, updateDoc, arrayRemove, onSnapshot} from 'firebase/firestore';
import ChatBox from "@/app/messages/chatbox/chatbox";
import {MessagesSquare} from "lucide-react";
import TableChat from '../../messages/tablechat/tablechat'

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
  const [playerIndex, setPlayerIndex] = useState(0);
  const [isValidBet, setIsValidBet] = useState(false);
  const [playerBets, setPlayerBets] = useState({});
  const isFirstPlayer = auth?.currentUser?.uid === players[0];
  const allPlayersHaveBet = players.length > 0 && players.every(playerId => playerBets[playerId]?.isValid);
  const [isFriendChatOpen, setIsFriendChatOpen] = useState(false);
  const [isTableChatOpen, setIsTableChatOpen] = useState(false);

  const [tableMessages, setTableMessages] = useState();
  const isCurrentPlayer = auth?.currentUser?.uid === players[playerIndex];

  const MIN_BET = 0;
  const MAX_BET = 10000;
  const BET_INCREMENT = 10;

  useEffect(() => {
    if (!tableId) return;

    const unsubscribe = onSnapshot(doc(db, 'Table', tableId), (snapshot) => {
      if (snapshot.exists()) {
        const tableData = snapshot.data();

        if (tableData.playerHands) {
          setPlayerHands(tableData.playerHands);
        }

        if (tableData.dealerHand) {
          setDealerHand(tableData.dealerHand);
        }

        if (typeof tableData.playerIndex === 'number') {
          setPlayerIndex(tableData.playerIndex);
          console.log("IN LISTENER", playerIndex)
        }

        if (typeof tableData.gameStarted === 'boolean') {
          setGameStarted(tableData.gameStarted);
        }

        if (tableData.players && Array.isArray(tableData.players)) {
          setPlayers(tableData.players);
        }

        if (tableData.playerBets) {
          setPlayerBets(tableData.playerBets);
        }
        if(tableData.tableChat){
          setTableMessages(tableData.tableChat)
        }
      }
    }, (error) => {
      console.error("Error in real-time listener:", error);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [tableId]);

  const updatePlayerIndex = async () => {
    if (!tableId) return;

    try {
      const tableRef = doc(db, 'Table', tableId);
      await updateDoc(tableRef, {
        playerIndex: playerIndex + 1
      });
      console.log("AFTER UPDATE FUNCTION", playerIndex)
    } catch (error) {
      console.error("Error updating player index in Firestore:", error);
    }
  };

  const updateGameState = async (newPlayerHands, newDealerHand, newPlayerIndex) => {
    if (!tableId) return;

    try {
      const tableRef = doc(db, 'Table', tableId);
      await updateDoc(tableRef, {
        playerHands: newPlayerHands,
        dealerHand: newDealerHand,
        playerIndex: newPlayerIndex
      });
    } catch (error) {
      console.error("Error updating hands in Firestore:", error);
    }
  };

  useEffect(() => {
    const loadPlayers = async () => {
      if (!tableId) {
        console.error("No tableId provided");
        return;
      }

      try {
        const tableRef = doc(db, 'Table', tableId);
        const tableSnap = await getDoc(tableRef);

        if (tableSnap.exists()) {
          const tableData = tableSnap.data();

          if (tableData.players && Array.isArray(tableData.players) && tableData.players.length > 0) {
            setPlayers([...tableData.players]);

            // Load saved hands if they exist
            if (tableData.playerHands) {
              setPlayerHands(tableData.playerHands);
            } else {
              const initialHands = {};
              tableData.players.forEach(playerId => {
                initialHands[playerId] = [];
              });
              setPlayerHands(initialHands);
            }

            if (tableData.dealerHand) {
              setDealerHand(tableData.dealerHand);
            }
            if(tableData.tableMessages){
              setTableMessages(tableData.tableMessages)
            }

            if (typeof tableData.playerIndex !== 'undefined') {
              setPlayerIndex(tableData.playerIndex);
              console.log("IN IF EXISTS", playerIndex)
            }

            sessionStorage.setItem('gameTableId', tableId);
          }
        }
      } catch (error) {
        console.error("Error loading game state:", error);
      }
    };

    if (tableId) {
      loadPlayers();
    }
  }, [tableId]);

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

  async function endGame(gameState) {
    if (!gameState || !gameState.gameStatus) return;

    const status = gameState.gameStatus.endStatus;
    if (status !== "IN_PROGRESS" && status !== "NEXT_PLAYER") {
      isGameOver(true);

      // Process each player in the game
      for (let i = 0; i < players.length; i++) {
        const playerId = players[i];
        const playerBet = playerBets[playerId]?.amount || 0;
        const docRef = doc(db, 'users', playerId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) continue;

        const userData = docSnap.data();
        const currentChips = userData['chipBalance'];
        const currentWins = userData['totalWins'];
        const currentLosses = userData['totalLosses'];

        switch(status) {
          case "PLAYER_WIN":
          case "DEALER_BUST":
            await updateDoc(docRef, {
              totalWins: currentWins + 1,
              chipBalance: currentChips + playerBet
            });
            break;

          case "PLAYER_BLACKJACK":
            const blackjackPayout = Math.trunc(playerBet * 1.5);
            await updateDoc(docRef, {
              totalWins: currentWins + 1,
              chipBalance: currentChips + blackjackPayout
            });
            break;

          case "DEALER_WIN":
          case "DEALER_BLACKJACK":
          case "PLAYER_BUST":
            await updateDoc(docRef, {
              totalLosses: currentLosses + 1,
              chipBalance: currentChips - playerBet
            });
            break;

          case "PUSH":
            break;
        }
      }

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

  const checkAllPlayerBets = () => {
    if (!players.length) return false;

    return players.every(playerId => {
      const playerBet = playerBets[playerId];
      return playerBet && playerBet.isValid && playerBet.amount > 0;
    });
  };

  const startGame = async () => {
    if (!players || players.length === 0) {
      console.error("No players available to start game");
      return;
    }

    const allBetsValid = checkAllPlayerBets();
    if (!allBetsValid) {
      console.error("Not all players have placed valid bets");
      return;
    }

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
          currentUserId: auth?.currentUser?.uid,
          playerBets: playerBets
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Connection failed: ${errorText}`);
      }

      const result = await response.json();

      // Update Firestore with initial game state
      const tableRef = doc(db, 'Table', tableId);
      await updateDoc(tableRef, {
        dealerHand: result.dealerHand || [],
        playerHands: result.players.reduce((hands, playerState, index) => {
          if (players[index]) {
            hands[players[index]] = playerState.hand || [];
          }
          return hands;
        }, {}),
        playerIndex: result.playerIndex || 0,
        gameStarted: true
      });

      setGameState(result);
    } catch (error) {
      console.error("Game failed to start", error);
    }
  };

  const playerHits = async () => {
    if (gameOver || auth?.currentUser?.uid !== players[playerIndex]) return;

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

      if (!result.players[playerIndex].isActive ||
          result.gameStatus?.endStatus === "PLAYER_WIN" ||
          result.gameStatus?.endStatus === "PLAYER_BUST" ||
          result.gameStatus?.endStatus === "NEXT_PLAYER") {
        await updatePlayerIndex();
      }

      console.log("AFTER PLAYER HITS AND IS INACTIVE", playerIndex)


      await updateDoc(doc(db, 'Table', tableId), {
        playerHands: newPlayerHands,
        dealerHand: result.dealerHand || []
      });

      console.log("AFTER UPDATE GAME STATE", playerIndex)


      endGame(result);
    } catch (error) {
      console.log("Hit failed", error);
    }
  };

  const playerStands = async () => {
    if (gameOver || auth?.currentUser?.uid !== players[playerIndex]) return;

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
      setPlayerStand(true);
      await updatePlayerIndex();

      console.log("AFTER STAND FUNCTION", playerIndex)

      await updateDoc(doc(db, 'Table', tableId), {
        playerHands: newPlayerHands,
        dealerHand: result.dealerHand || []
      });

      console.log("AFTER UPDATE GAME STATE", playerIndex)


      endGame(result);
    } catch (error) {
      console.log("Stand failed", error);
    }
  };

  const promptAce = async (selectedValue) => {
    if (!gameStarted || !gameState || auth?.currentUser?.uid !== players[playerIndex]) return;

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
      setGameState(result);
      setShowAceModal(false);

      // Persist hands to Firestore
      if (!result.players[playerIndex].isActive ||
          result.gameStatus?.endStatus === "PLAYER_WIN" ||
          result.gameStatus?.endStatus === "PLAYER_BUST" ||
          result.gameStatus?.endStatus === "NEXT_PLAYER") {
        await updatePlayerIndex();
      }

    } catch (error) {
      console.log("Prompt Ace failed", error);
    }
  };

  useEffect(() => {
    if (gameStarted && gameState && gameState.hasAce === true &&
        auth?.currentUser?.uid === players[playerIndex]) {
      setShowAceModal(true);
    }
  }, [gameState?.hasAce, playerIndex, players]);

  const handleAceValueSelect = (value) => {
    promptAce(value);
  };

  const handleBetPlaced = async (betValue) => {
    const bet = betValue.target.value;
    setBetAmount(bet);
    const isValid = await validateBet(bet);

    if (isValid) {
      // Update Firestore with the new bet
      const tableRef = doc(db, 'Table', tableId);
      const currentUserId = auth?.currentUser?.uid;

      try {
        const newPlayerBets = {
          ...playerBets,
          [currentUserId]: {
            amount: parseFloat(bet),
            isValid: true,
          }
        };

        await updateDoc(tableRef, {playerBets: newPlayerBets});

        setPlayerBets(newPlayerBets);
      } catch (error) {
        console.error("Error updating bet in Firestore:", error);
      }
    }
  };

  const handleCloseFriendChat = () => {
    console.log("Closing chat...");
    setIsFriendChatOpen(false);
    console.log("Chat is now closed:", isFriendChatOpen);
  };
  useEffect(() => {
    console.log("isChatOpen changed:", isFriendChatOpen);
  }, [isFriendChatOpen]);

  const handleCloseTableChat = () => {
    console.log("Closing chat...");
    setIsTableChatOpen(false);
    console.log("Chat is now closed:", isTableChatOpen);
  };
  useEffect(() => {
    console.log("isChatOpen changed:", isTableChatOpen);
  }, [isTableChatOpen]);

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

          {!gameStarted ? (
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
              {isFirstPlayer && (
                <div className="start-container">
                  <button
                    className="btn btn-lg btn-success"
                    onClick={startGame}
                    disabled={!allPlayersHaveBet}
                  >
                    {allPlayersHaveBet ? "Start Game" : "Waiting for all players to bet..."}
                  </button>
                </div>
              )}
            </div>
          ) : null}

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

          {gameStarted && !gameOver && (
            <div className="btn-container">
              <button
                className="action-btn"
                onClick={playerHits}
                disabled={!isCurrentPlayer || playerStand}
              >
                Hit
              </button>
              <button
                className="action-btn"
                onClick={playerStands}
                disabled={!isCurrentPlayer || playerStand}
              >
                Stand
              </button>
            </div>
          )}

          {gameStarted && (
            <div className="all-players-container">
              {Array.isArray(players) && players.length > 0 ? (
                players.map((playerId, index) => (
                  <div key={playerId}
                       className={`playerHand-container ${index === playerIndex ? 'active-player' : ''}`}>
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
            <div className="icons-btn" onClick={() => setIsFriendChatOpen((prev) => !prev)}>
              <MessageIcon/>
              {isFriendChatOpen && <ChatBox onClose={handleCloseFriendChat}/>}
            </div>
          </div>
          <div className="table-chat-icon">
            <div className="icons-btn" onClick={() => setIsTableChatOpen((prev) => !prev)}>
              <MessagesSquare/>
              {isTableChatOpen && <TableChat db={db} tableId={tableId} onClose={handleCloseTableChat}/>}
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