# square-fall24-blackjack
## Overview
This project is our Blackjack web app for our CS482 class in Fall of 2024. It includes many features, such as different user types, tables for different blackjack games, accessing personal stats, and more.

## Landing Page
When you first get to our app, you have a few options: signup for an account, login as existing user, play as guest, or view blackjack tutorial.

## Signing up
To sign up for an account, you provide your first and last name, a username that isn't already taken, an email that isn't already associated with and account, and a password of at least 8 characters.

## Tables
Tables can be created by any type of user once in the app. If no tables are present and you would like to play a game, you must create a table first. When creating a table, you can set the amount of players anywhere between 1-6. You must set a minimum bet for players to join, which cannot exceed $10,000. Once all of that is set, you are automatically taken to a game to play against the dealer, which is a bot. 

When any player joins the table and is placing their bet, they can access the table chat at the bottom left corner of the screen, particularly the rightmost icon there. It is essentially a "group chat" for the table.

## Play as Guest
To play as a guest, you just need to provide a username. If that username is already taken, you will be prompted to choose another one. Once you are in, by default, you will be given $2500 worth of chips. If that ever reaches 0, you will be notified and your account will be replenished (as per client request). Guests have no resrictions when it comes to what tables to play at, unless the max player amount at the table has been reached.

Once a guest is done playing, they can click the "Exit Game" button, which is found when you click your username in the right side of the navigation bar. This effectively deletes the guest user.

### Message Admin
Guests have the ability to message admin. You can access the messaging at the bottom left corner when placing your bet or in a game. It is the leftmost icon.

## Login as Account User
To login, you must provide your username and password. As a basic account user, you have everything a guest has access to, in addition to more.

_Note: Anytime you need to get back to the home page, you can click on our logo at the top left corner._

### View Stats
To view your personal stats, you can click on "View Stats" on the navigation bar at the top of the home page. Here, you will see the amount of games won, amount of games lost, and your chip balance.

### Manage Friends
Account Users can access the "Manage Friends" page from the navigation bar at the top of the Home page. Once there, you will see a list of users on the left that you don't have added as friends, and your current friends on the right. From here, you can add or remove friends.

## Messaging Friends
Account users can access the friend chat the same way guests access the admin chat. You can type in your friend's username to begin a chat with them. It is important to note that **the only way an account user can change account information is by messaging an admin user** here for them to change it. This was per client request.

### Logout
To logout, you can click yuor username found in the right side of the navigation bar, then click "Logout."

## Login as admin
Admin have access to everything that account users have, in addition to managing users.

### Manage Users
To access the "Manage Users" page, you can click the link toward the left side of the navigation bar in the home page. Here, you can edit any user information, such has first name, last name, username, email, and password. 

## Things to Update
There are many things that we did not have time to get around to, such as:
- Move friend chat to lobby
- Add usernames to table chats
- Remove the option to add guests as friends
- Remove guests from the "Manage Users" page
- Fix the end game status
- Include "Play Again" button

Having these additions would greatly improve user experience.
  


