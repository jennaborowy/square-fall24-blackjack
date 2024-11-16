'use client'
import React, {useEffect, useState} from "react";
import Card from '../card';
import '../card.css'
import '../icons.css'
import '../gameinfo.css'
import AceModal from '../AceModal'
import NewGameButton from '../NewGameButton'
import GameInfo from '../GameInfo'
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import {FriendsIcon, MessageIcon} from '../icons';
import PlaceBetAnimation from '../BetTypeAnimation'
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc, deleteDoc, updateDoc, arrayRemove, onSnapshot } from 'firebase/firestore';
import ChatBox from "@/app/messages/chatbox/chatbox";

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
  const isFirstPlayer = auth?.currentUser?.uid === players[0];
  const [playerBets, setPlayerBets] = useState({});
  const allPlayersHaveBet = players.length > 0 && players.every(playerId => playerBets[playerId]?.isValid);

  const MIN_BET = 0;
  const MAX_BET = 10000;
  const BET_INCREMENT = 5;

  const checkAllPlayerBets = () => {
    if (!players.length) return false;

    // Check if we have a valid bet for every player
    return players.every(playerId => {
      const playerBet = playerBets[playerId];
      return playerBet && playerBet.isValid && playerBet.amount > 0;
    });
  };

  useEffect(() => {
    if (!tableId) return;

    // Set up real-time listener for the table document
    const unsubscribe = onSnapshot(doc(db, 'Table', tableId), (snapshot) => {
      if (snapshot.exists()) {
        const tableData = snapshot.data();

        // Update player hands
        if (tableData.playerHands) {
          setPlayerHands(tableData.playerHands);
        }

        // Update dealer hand
        if (tableData.dealerHand) {
          setDealerHand(tableData.dealerHand);
        }

        // Update current player index
        if (typeof tableData.currentPlayerIndex === 'number') {
          setCurrentPlayerIndex(tableData.currentPlayerIndex);
        }

        // Update game started status
        if (typeof tableData.gameStarted === 'boolean') {
          setGameStarted(tableData.gameStarted);
        }

        // Update players array if needed
        if (tableData.players && Array.isArray(tableData.players)) {
          setPlayers(tableData.players);
        }
        // Update player bets
        if (tableData.playerBets) {
          setPlayerBets(tableData.playerBets);
        }
      }
    }, (error) => {
      console.error("Error in real-time listener:", error);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [tableId]);

  // Function to update player's hand
  const updatePlayerHandInFirestore = async (playerId, hand) => {
    if (!tableId) return;

    try {
      const tableRef = doc(db, 'Table', tableId);
      await updateDoc(tableRef, {
        [`playerHands.${playerId}`]: hand,
      });
      console.log(`Hand updated for player ${playerId} in Firestore`);
    } catch (error) {
      console.error("Error updating player hand in Firestore:", error);
    }
  };

  const updateDealerHandInFirestore = async (dealerHand) => {
    if (!tableId) return;

    try {
      const tableRef = doc(db, 'Table', tableId);
      await updateDoc(tableRef, {
        dealerHand: dealerHand,
      });
      console.log("Dealer's hand updated in Firestore");
    } catch (error) {
      console.error("Error updating dealer's hand in Firestore:", error);
    }
  };

  useEffect(() => {
    console.log("Initial tableId:", tableId);
    if (!tableId) {
      const storedTableId = sessionStorage.getItem('gameTableId');
      if (storedTableId) {
        console.log("Found stored tableId:", storedTableId);
      }
    }
  }, []);

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

        if (tableSnap.exists()) {
          const tableData = tableSnap.data();
          console.log("Table data loaded:", tableData);

          if (tableData.players && Array.isArray(tableData.players) && tableData.players.length > 0) {
            setPlayers([...tableData.players]);

            const initialHands = {};
            tableData.players.forEach(playerId => {
              initialHands[playerId] = [];
            });
            setPlayerHands({...initialHands});

            sessionStorage.setItem('gameTableId', tableId);
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
      loadPlayers();
    }
  }, [tableId]);

  const validateBet = async (betAmount) => {
    try {
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

      const currentUserId = auth?.currentUser?.uid;
      if (currentUserId) {
        const newPlayerBets = {
          ...playerBets,
          [currentUserId]: {
            amount: bet,
            isValid: true
          }
        };

        await updateDoc(tableRef, {playerBets: newPlayerBets});
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
    if (status !== "IN_PROGRESS") {
      isGameOver(true);

      const user = auth?.currentUser?.uid;
      const docRef = doc(db, 'users', user);
      const docSnap = await getDoc(docRef);

      if (status == "PLAYER_WIN" ||
          status == "PLAYER_BLACKJACK" || status == "DEALER_BUST") {

        if (docSnap.exists()) {
          const currentWins = docSnap.data()['totalWins'];
          const currentChips = docSnap.data()['chipBalance'];
          await updateDoc(docRef, {totalWins: currentWins + 1});

          if (status == "PLAYER_BLACKJACK") {
            const payout = Math.trunc(Number(betAmount) * 1.5);
            await updateDoc(docRef, {chipBalance: currentChips + payout});
          } else
            await updateDoc(docRef, {chipBalance: currentChips + Number(betAmount)});
        }
      } else if (status == "DEALER_WIN" ||
          status == "DEALER_BLACKJACK" || status == "PLAYER_BUST") {
        if (docSnap.exists()) {
          const currentLosses = docSnap.data()['totalLosses'];
          const currentChips = docSnap.data()['chipBalance'];
          await updateDoc(docRef, {totalLosses: currentLosses + 1});
          await updateDoc(docRef, {chipBalance: currentChips - Number(betAmount)});
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
        currentPlayerIndex: result.currentPlayerIndex || 0,
        gameStarted: true
      });

      setGameState(result);
    } catch (error) {
      console.error("Game failed to start", error);
    }
  };

  useEffect(() => {
    console.log('Current player bets:', playerBets);
    console.log('All bets valid:', checkAllPlayerBets());
  }, [playerBets]);

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

      // Update the current player's hand and index in Firestore
      const currentPlayerId = players[currentPlayerIndex];
      await updatePlayerHandInFirestore(currentPlayerId, newPlayerHands[currentPlayerId]);
      await updateDealerHandInFirestore(result.dealerHand || []);
      await updateDoc(doc(db, 'Table', tableId), {
        currentPlayerIndex: result.currentPlayerIndex || 0
      });

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

      await updateDealerHandInFirestore(result.dealerHand || []);
      await updateDoc(doc(db, 'Table', tableId), {
        currentPlayerIndex: result.currentPlayerIndex || 0
      });

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

        await updateDoc(tableRef, {
          playerBets: newPlayerBets
        });

        setPlayerBets(newPlayerBets);
      } catch (error) {
        console.error("Error updating bet in Firestore:", error);
      }
    }
  };


  const isCurrentPlayer = auth?.currentUser?.uid === players[currentPlayerIndex];

  const handleClose = () => {
    console.log("Closing chat...");
    setIsChatOpen(false);
    console.log("Chat is now closed:", isChatOpen);
  };
  useEffect(() => {
    console.log("isChatOpen changed:", isChatOpen);
  }, [isChatOpen]);

  return (
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

        {/* Dealer Area */}
        {gameStarted && (
            <div className="dealerHand-container">
              {dealerHand.map((card, index) => (
                  <Card key={index} suit={card.suit} rank={card.rank}/>
              ))}
            </div>
        )}

        {/* Betting or Action Area */}
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
        ) : (
            gameStarted && isCurrentPlayer && !playerStand && (
                <div className="btn-container">
                  <button className="action-btn" onClick={playerHits}>Hit</button>
                  <button className="action-btn" onClick={playerStands}>Stand</button>
                </div>
            )
        )}

        {/* Player Hands Area */}
        {gameStarted && (
            <div className="all-players-container">
              <div className="left-column">
                {[0, 2, 4].map((index) => (
                    players[index] && (
                        <div
                            key={players[index]}
                            className={`playerHand-container ${index === currentPlayerIndex ? 'active-player' : ''}`}
                        >
                          {playerHands[players[index]]?.map((card, cardIndex) => (
                              <Card key={cardIndex} suit={card.suit} rank={card.rank}/>
                          ))}
                        </div>
                    )
                ))}
              </div>
              <div className="right-column">
                {[1, 3, 5].map((index) => (
                    players[index] && (
                        <div
                            key={players[index]}
                            className={`playerHand-container ${index === currentPlayerIndex ? 'active-player' : ''}`}
                        >
                          {playerHands[players[index]]?.map((card, cardIndex) => (
                              <Card key={cardIndex} suit={card.suit} rank={card.rank}/>
                          ))}
                        </div>
                    )
                ))}
              </div>
            </div>
        )}

        {gameOver && (
            <div className="end-container">
              {gameStatusMessage}
            </div>
        )}

        <div className="message-icon">
          <div className="icons-btn" onClick={() => setIsChatOpen((prev) => !prev)}>
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
  );
}