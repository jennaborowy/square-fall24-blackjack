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
import {FriendsIcon, MessageIcon, TableChatIcon} from '../icons';
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
  const [handledAces, setHandledAces] = useState({});
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

  const [showAceButton, setShowAceButton] = useState(false);
  const [tableMessages, setTableMessages] = useState();
  const isCurrentPlayer = auth?.currentUser?.uid === players[playerIndex];

  const MIN_BET = 0;
  const MAX_BET = 10000;
  const BET_INCREMENT = 10;


  // firebase subscription listener for all relevant information regarding users/games
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
      }
    }, (error) => {
      console.error("Error in real-time listener:", error);
    });
    return () => unsubscribe();
  }, [tableId]);


  // updates the player index aka next player's turn (or dealer if last player)
  const updatePlayerIndex = async () => {
    if (!tableId) return;

    try {
      const newIndex = playerIndex + 1;
      console.log('Updating player index:', {current: playerIndex, new: newIndex});

      const tableRef = doc(db, 'Table', tableId);
      await updateDoc(tableRef, {
        playerIndex: newIndex,
        currentPlayerId: players[newIndex] || null
      });

      return new Promise(resolve => {
        setPlayerIndex(newIndex);
        // Use a callback to ensure state is updated
        setTimeout(resolve, 0);
      });
    } catch (error) {
      console.error("Error updating player index:", error);
    }
  };


  // processes each player's stats based on their game status
  const processWinLossPush = async (playerId, playerValue, dealerValue, playerBet, userData, docRef) => {
    console.log('Processing outcome for player:', {
      playerId,
      playerValue,
      dealerValue,
      playerBet
    });

    if (dealerValue > 21) {
      console.log('Dealer busted - Player wins');
      await updateDoc(docRef, {
        totalWins: userData.totalWins + 1,
        chipBalance: userData.chipBalance + playerBet
      });
      await updateTableStatus(playerId, "PLAYER_WIN");
    } else if (dealerValue > playerValue) {
      console.log('Dealer wins with higher value');
      await updateDoc(docRef, {
        totalLosses: userData.totalLosses + 1,
        chipBalance: userData.chipBalance - playerBet
      });
      await updateTableStatus(playerId, "DEALER_WIN");
    } else if (dealerValue < playerValue) {
      console.log('Player wins with higher value');
      await updateDoc(docRef, {
        totalWins: userData.totalWins + 1,
        chipBalance: userData.chipBalance + playerBet
      });
      await updateTableStatus(playerId, "PLAYER_WIN");
    } else {
      console.log('Push - equal values');
      await updateTableStatus(playerId, "PUSH");
    }
  };


  // updates the firebase record with individual player statuses
  const updateTableStatus = async (playerId, status) => {
    try {
      const tableRef = doc(db, 'Table', tableId);
      const tableDoc = await getDoc(tableRef);

      if (tableDoc.exists()) {
        const currentStatuses = tableDoc.data().playerStatuses || {};
        await updateDoc(tableRef, {
          playerStatuses: {
            ...currentStatuses,
            [playerId]: status
          }
        });
      }
    } catch (error) {
      console.error("Error updating table status:", error);
    }
  };


  // loads the player data for
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

            if (typeof tableData.playerIndex !== 'undefined') {
              setPlayerIndex(tableData.playerIndex);
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


  // stores the valid bets in firestore
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


  // handles the cleanup in firestore and local state of the player leaving the table
  const handleLeaveTable = async () => {
    if (!tableId || !auth?.currentUser?.uid) {
      window.location.href = '/lobby';
      return;
    }

    try {
      // Call Spring backend to clean up local game state
      await fetch('http://localhost:8080/endgame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({tableId}),
      });

      // Clean up Firestore
      const tableRef = doc(db, 'Table', tableId);
      const updatedTableSnap = await getDoc(tableRef);

      if (updatedTableSnap.exists()) {
        const tableData = updatedTableSnap.data();
        const remainingPlayers = tableData.players.filter(id => id !== auth.currentUser.uid);

        if (remainingPlayers.length === 0) {
          // If last player, delete the table
          await deleteDoc(tableRef);
        } else {
          // Otherwise, remove the player from the table
          await updateDoc(tableRef, {
            players: remainingPlayers,
            playerHands: Object.fromEntries(
              Object.entries(tableData.playerHands || {})
                .filter(([id]) => id !== auth.currentUser.uid)
            ),
            playerBets: Object.fromEntries(
              Object.entries(tableData.playerBets || {})
                .filter(([id]) => id !== auth.currentUser.uid)
            ),
            // If the leaving player was the current player, update playerIndex
            playerIndex: tableData.playerIndex > remainingPlayers.length ?
              remainingPlayers.length :
              Math.min(tableData.playerIndex, remainingPlayers.length - 1)
          });
        }
      }

      // Clean up session storage
      sessionStorage.removeItem('gameTableId');
      sessionStorage.removeItem('playerId');
      sessionStorage.removeItem('tableName');

      // Redirect to lobby
      window.location.href = '/lobby';
    } catch (error) {
      console.error("Error leaving table:", error);
      // Still redirect to lobby even if there's an error
      window.location.href = '/lobby';
    }
  };


  // verifies that all players have entered a valid bet
  const checkAllPlayerBets = () => {
    if (!players.length) return false;

    return players.every(playerId => {
      const playerBet = playerBets[playerId];
      return playerBet && playerBet.isValid && playerBet.amount > 0;
    });
  };


  // function for starting the game at the correct state
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


  // player hits function
  const playerHits = async () => {
    console.log('=== PLAYER HIT ===');

    const tableSnapshot = await getDoc(doc(db, 'Table', tableId));
    const currentDbPlayerIndex = tableSnapshot.data().playerIndex;
    console.log('=== DB PLAYER INDEX ===', currentDbPlayerIndex);

    if (gameOver || auth?.currentUser?.uid !== players[currentDbPlayerIndex]) return;

    try {
      const response = await fetch('http://localhost:8080/hit', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          tableId: tableId,
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

      await updateDoc(doc(db, 'Table', tableId), {
        playerHands: newPlayerHands,
        playerIndex: result.currentPlayerIndex,
        dealerHand: result.dealerHand || []
      });

      setPlayerHands(newPlayerHands);
      setPlayerIndex(result.currentPlayerIndex);

      // If this was the last player, dealer's turn
      if (result.currentPlayerIndex >= players.length) {
        console.log('=== DEALER TURN STARTING ===');
        const dealerResult = await playDealer();
        await processGameResults(result.players, dealerResult);
      }
    } catch (error) {
      console.error("Hit failed:", error);
    }
  };


  // player stands function
  const playerStands = async () => {
    console.log('=== PLAYER STAND ===');

    if (playerIndex >= players.length) {
      console.log('Game is over - no more active players');
      return;
    }

    console.log(players[playerIndex])
    const tableSnapshot = await getDoc(doc(db, 'Table', tableId));
    const currentDbPlayerIndex = tableSnapshot.data().playerIndex;
    if (gameOver || auth?.currentUser?.uid !== players[currentDbPlayerIndex]) return;

    try {
      const response = await fetch('http://localhost:8080/stand', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          tableId: tableId,
          stand: true,
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

      // dealer's turn if that was the last player
      const isLastPlayer = playerIndex === players.length - 1;
      const shouldPlayDealer = isLastPlayer &&
        result.players.some((player, idx) => {
          return idx < players.length && player.value <= 21;
        });

      if (shouldPlayDealer) {
        console.log('=== DEALER TURN STARTING ===');
        const dealerResult = await playDealer();
        await processGameResults(result.players, dealerResult);
      }

      setPlayerHands(newPlayerHands);
      setPlayerStand(true);
      await updatePlayerIndex();

      await updateDoc(doc(db, 'Table', tableId), {
        playerHands: newPlayerHands,
        dealerHand: result.dealerHand || []
      });

    } catch (error) {
      console.log("Stand failed:", error);
    }
  };


  // prompts the user for the ace selection
  const promptAce = async (selectedValue) => {
    if (!gameStarted || !gameState || auth?.currentUser?.uid !== players[playerIndex]) return;
    console.log('=== IN PROMPT ACE ===');
    try {
      const response = await fetch('http://localhost:8080/promptAce', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          aceValue: selectedValue,
          tableId: tableId,
          playerId: auth?.currentUser?.uid
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
      setGameState(result);
      setShowAceModal(false);
      setShowAceButton(true);

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


  // Dealer Turn function
  const playDealer = async () => {
    try {
      const response = await fetch('http://localhost:8080/dealerTurn', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          tableId: tableId,
          players: players
        }),
      });

      if (!response.ok) throw new Error("Dealer play failed");
      const result = await response.json();

      setDealerHand(result.dealerHand || []);

      await updateDoc(doc(db, 'Table', tableId), {
        dealerHand: result.dealerHand || []
      });

      return result;

    } catch (error) {
      console.error("Dealer play failed:", error);
      throw error;
    }
  };


  // processes the individual game states for each player
  const processGameResults = async (playerStates, dealerResult) => {
    for (let i = 0; i < players.length; i++) {
      const playerId = players[i];
      const playerBet = playerBets[playerId]?.amount || 0;
      const docRef = doc(db, 'users', playerId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) continue;

      const userData = docSnap.data();
      const playerState = playerStates[i];
      const playerValue = playerState.value;
      const dealerValue = dealerResult.dealerHand?.reduce((total, card) =>
        total + card.value, 0) || 0;

      if (playerValue > 21) {
        // Handle busted players
        console.log('Processing bust for player:', playerId);
        await updateDoc(docRef, {
          totalLosses: userData.totalLosses + 1,
          chipBalance: userData.chipBalance - playerBet
        });
        await updateTableStatus(playerId, "PLAYER_BUST");
      } else {
        // Process non-busted players
        await processWinLossPush(playerId, playerValue, dealerValue,
          playerBet, userData, docRef);
      }
    }
  };


  // use effect for tracking the ace handling modal
  useEffect(() => {
    const currentUserId = auth?.currentUser?.uid;
    const isCurrentPlayer = currentUserId === players[playerIndex];
    const currentPlayerHand = playerHands[currentUserId];

    if (gameStarted &&
      isCurrentPlayer &&
      hasAce(currentPlayerHand) &&
      !handledAces[currentUserId]) {
      setShowAceModal(true);
      console.log('=== IN PLAYER ', currentUserId, ' HAS ACE AND HAS NOT SET VALUE YET ===');
    } else {
      setShowAceModal(false);
      if (isCurrentPlayer) {
        console.log('=== IN PLAYER ', currentUserId, ' EITHER HAS NO ACE OR HAS ALREADY SET VALUE ===');
      }
    }
  }, [gameState, playerIndex, players, handledAces, playerHands]);


  // handles the selection of the ace value 1 or 11
  const handleAceValueSelect = async (value) => {
    console.log('=== IN HANDLE ACE VALUE SELECT ===');
    const currentUserId = auth?.currentUser?.uid;

    const newHandledAces = {
      ...handledAces,
      [currentUserId]: true
    };

    try {
      const tableRef = doc(db, 'Table', tableId);
      await updateDoc(tableRef, {
        handledAces: newHandledAces
      });

      setHandledAces(newHandledAces);
      setShowAceModal(false);

      await promptAce(value);
      console.log(playerHands);
      console.log("Ace value is now", value)
    } catch (error) {
      console.error("Error updating ace handled state:", error);
    }
  };

    // checks that all bets are placed
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
    }

    // T/F if the hand has an ace
    const hasAce = (hand) => {
      return hand?.some(card => card.rank === 'A');
    };

  useEffect(() => {
    const currentUserId = auth?.currentUser?.uid;
    const currentPlayerHand = playerHands[currentUserId];

    if (currentPlayerHand) {
      setShowAceButton(hasAce(currentPlayerHand));
    } else {
      setShowAceButton(false); // Reset if no hand exists
    }
  }, [playerHands]);

  //THIS IS HIP TOO - Callie, this code completes the change ace, allowing the user to switch their
  //ace value between 1 and 11 after being prompted initially, given that they wont bust
  const ChangeAce = () => {
    return (
        <div className="ace-btns-container">
          <button className="btn btn-primary"
            onClick={() => handleAceValueSelect(1)}
          >
            Set Ace to 1
          </button>
          <button class="btn btn-primary"
            onClick={() => handleAceValueSelect(11)}
          >
            Set Ace to 11
          </button>
      </div>
    );
  };

  // handles opening the chat
  useEffect(() => {
    console.log("isChatOpen changed:", isTableChatOpen);
  }, [isTableChatOpen]);


  // Display for flipping the dealer's second card
  const FlippableCard = ({suit, rank, isFlipped}) => {
    return (
        <div className={`cardArea card-flip ${isFlipped ? 'has-flipped' : ''}`}>
          <div className="card-front">
            <Card suit={suit} rank={rank}/>
          </div>
          <div className="card-back"/>
        </div>
      );
    };


    // JSX component for rendering in [tableId]/page.js
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
                disabled={playerIndex < players.length}
              >
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
                index === 1 ? (
                  <FlippableCard
                    key={index}
                    suit={card.suit}
                    rank={card.rank}
                    isFlipped={playerIndex < players.length}
                  />
                ) : (
                  <Card key={index} suit={card.suit} rank={card.rank}/>
                )
              ))}
            </div>
          )}

          {gameOver && (
            <div className="end-container">
              {gameStatusMessage}
            </div>
          )}

          {gameStarted && !gameOver && (

            <div className="stack-btn-container">
                  <ChangeAce/>
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
              <TableChatIcon/>
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