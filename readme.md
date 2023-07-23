# Chess Champions

## Introduction

Chess Champions is a website where the user can play a game of chess the way they want against a friend or a computer of varying levels of difficulty. The aim of the site is to entertain the user with a game that is over 1500 years old.

The website is deployed to Github Pages and can be found here: <https://shanebyrne0963.github.io/chess-champions/>

![Chess Champions displayed on different devices](assets/images/readme/site-display.jpg)

## UI/UX Design

### Color Scheme

- The website has a simple and uniform color scheme, with all text colored white displayed on a brown shaded background
- The brown color is designed to resemble the outside chessboard, and gives the website a wood-like asthetic
- Some areas of the website have different shades of brown to add color diversity to the page

### Typography

- The website uses a single font, Roboto Slab, for its headings and normal text
- The use of a single font is to maintain font style consistency across the site
- This font was used because it is an easy to read serif font, with a style that represents the old-fashioned nature of the game well

### Wireframes

- For desktop screen sizes:
    - index.html
        - ![Desktop wireframe for index.html](assets/images/readme/wireframes/index-desktop.jpg)
    - game.html
        - ![Desktop wireframe for game.html](assets/images/readme/wireframes/game-desktop.jpg)
- For tablet screen sizes:
    - index.html structure remains the same as on desktop
    - game.html
        - ![Tablet wireframe for game.html](assets/images/readme/wireframes/game-tablet.jpg)
- For mobile screen sizes:
    - index.html
        - ![Mobile wireframe for index.html](assets/images/readme/wireframes/index-mobile.jpg)
    - game.html
        - ![Mobile wireframe for game.html](assets/images/readme/wireframes/game-mobile.jpg)

## Features

### Content

- **Game Settings Page**
    - The game settings page is the first page the user is presented with, and provides a wide range of settings for them to customize the game to their liking
    - The user can change the following:
        - Types of players playing the game (Player vs. Player, Player vs. Computer, Computer vs. Computer)
        - Each of the player names (Up to 2)
        - Which side the two different colors will start on
        - The color of the player (Player vs. Computer only)
        - An optional time limit with a minimum time of 30 seconds and a maximum time of 10 hours (Player vs. Player only)
        - The difficulty of the computer, with a range from 0 (easy) to 100 (hard)
        - If a pawn moving to the other side of the board can be promoted to any piece or if they can only bring back eliminated pieces
        - If the castling move is allowed in the game
        - If the en passant move is allowed in the game
    - These settings are stored in localStorage so they will be remembered when the user returns to the site

- **Game Page**
    - On entering the game page, the game immediately starts, following the rules you would expect in a normal game of chess:
    - *Game Rules* ([Click here to get a more in-depth description](https://en.wikipedia.org/wiki/Rules_of_chess))
        - There are 6 different pieces present on the board: The pawn, knight, bishop, rook, queen and king, each with a different set of moves
        - Both players start with 8 pawns, 2 knights, 2 bishops, 2 rooks, 1 queen and 1 king
        - ![Layout of a chess board](assets/images/readme/content/board-layout.PNG)
        - The aim of the game is to checkmate the opponent's king, leaving them with no other moves that will result in the king surviving
    - *Advanced Moves*
        - The game has support for the lesser known advanced moves ["Castling"](https://en.wikipedia.org/wiki/Castling) and ["En passant"](https://en.wikipedia.org/wiki/En_passant)
        - These moves are not used by everyone, which is why there are options to disable them

### User Interface

- **Game Settings Page**
    - Upon entering the website, the user is greeted with an assortment of options that lets them customize their game experience.
    - The first setting is a select input requesting the type of players that will play the game. There are 3 different options:
        - Player versus Player
        - Player versus Computer
        - Computer versus Computer
    - ![The players select input](assets/images/readme/user-interface/select-players.PNG)
    - This select input will change the rest of the inputs depending on what is selected. This is done so that settings that are only relevant to the type of players are shown to the user.
    - ![The inputs that depend on the player type](assets/images/readme/user-interface/settings-dynamic.PNG)
    - Below the dynamic settings There is a drop-down menu for advanced moves. These are hidden by default to prevent too much information being displayed on the screen on page load.
    - ![The advanced moves](assets/images/readme/user-interface/advanced-moves.PNG)
    - Centered at the bottom of the settings element, there is an anchor element that takes the user to the game, applying all the settings that have been inputted
    - If the user selected "Computer vs. Computer", the text for the anchor will change from "Play Game!" to "Watch Game!" as the user will not be interacting with the game on this setting
    - ![The anchor go to the game page](assets/images/readme/user-interface/game-anchor.PNG)
    - The game settings page gives the user a lot of control over how their game is played

- **Game Page**
    
    - The game page is made up of several UI elements:
        - The chess board
        - The player turn heading
        - 2 player user interfaces
        - An announcements section
        - A game options section
        - A banner over the chess board
    - ![The user interface elements put together on a desktop screen](assets/images/readme/user-interface/game.PNG)
    - *Chess Board:*
        - This is where the main gameplay happens
        - The board is made up of an 8x8 grid of tiles
        - The user can interact with their pieces to select them when it is their turn, and can click on any tile the selected piece can move to
        - The possible moves are represented by icons that appear over the tile. There are different icons for different moves
    - ![The chess board showing the possible moves of the rook](assets/images/readme/user-interface/chess-board.PNG)
    - *Player Turn Heading*
        - Notifies the user which player is currently taking their turn
        - Always situated on the top-left corner of the screen, making it more likely for the user to notice it
    - ![The player turn heading notifying the player it is their turn](assets/images/readme/user-interface/turn-heading.PNG)
    - *Player User Interfaces*
        - Underneath the player turn heading are 2 player user interfaces side by side. For mobile screens they appear under the announcement
        - At the top of this UI, the player's name and their color represented by the king piece to the right of it is displayed
        - In the middle, there is an array of icons for each piece that player has eliminated
        - If a player's pawn reaches the other side of the board and has to pick an eliminated piece to promote to, the icons that the player can revive will begin to flash. This is done to draw attention to the user so they know what to click on
        - At the bottom of the UI, there is a clock icon with the amount of time the user has to make the move remaining. This feature is only available in player vs player, and if the user requested a time limit
        - If the UI belongs to the player that is taking their turn, the element will have a white outline, making it clearer whose turn it is
    - ![The 2 player user interfaces side by side](assets/images/readme/user-interface/player-ui.PNG)
    - *Announcements*
        - Announcements appear under the player user interfaces for desktop and under the chess board for tablets and mobile phones
        - Each time an event happens, a new notification will appear at the bottom of the element, notifying the user of the event
        - The announcements will let the user know about a pawn elimination, check, checkmate or timeout
        - Any new announcements will be gold in color until the next turn, differentiating it from announcements that are less relevant
        - This part of the user interface is important because it informs the user about what is happening in the game, in case there is something they missed or did not notice
    - ![The announcements part of the user interface](assets/images/readme/user-interface/announcements.PNG)
    - *Game Options*
        - Situated at the bottom of the user interface, this section consists of 2 buttons
        - The first button resets the game, clearing any changes and setting up the chess board. This button does not take the user to another page
        - The second button is an anchor that returns the user to the game settings page
        - This main purpose of this part of the UI is to allow the user to make changes to the game settings if they are not happy with them, or start the game over if desired
    - ![The 2 game options buttons](assets/images/readme/user-interface/game-options.PNG)
    - *Banner*
        - The banner displays a heading, subheading and sometimes a grid of icons over the chess board and is only visible when the game has paused or ended
        - This only happens when a player is promoting a pawn, on checkmate or if a player runs out of time
        - On pawn promotion, if the user has chosen to promote the pawn to any piece, 4 icons, the knight, the bishop, the rook and the queen, will appear under the text
        - The color of these icons depends on the color of the player that has activated the banner
        - On game end, the banner will disappear after 5 seconds to allow the user to see the board again, if they desire
        - Because the banner appears over the chess board, it is a very effective way of informing the player of the steps they need to take to continue the game, without leaving the user wondering what to do next
    - ![The banner over the chess board](assets/images/readme/user-interface/banner.PNG)

## Testing

### Bugs

### Manual Testing

### Validator Testing

### Unfixed Bugs

## Deployment and Local Development

### Deploy on Github Pages

### Cloning Repositories

### Forking Repositories

## Credits

### Content

### Media
