# Galaxy game
## Planet Collection Game

This is a simple grid-based game where the player (represented by the sun) must navigate through a field of obstacles (black holes) to collect all the planets and reach the green-bordered finish line.

## Table of Contents

- [Getting Started](#getting-started)
- [Game Modes](#game-modes)
- [Controls](#controls)
- [Assets](#assets)
- [Technical Details](#technical-details)
- [Testing the API](#testing-the-api)

## Getting Started

### Prerequisites

To run this game, you will need a web server to serve the files. You can use `http-server`, a simple, zero-configuration command-line http server for Node.js.

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/ivanaaaa/galaxy.git
    cd planet-collection-game
    ```

2. Install `http-server` globally using npm:
    ```bash
    npm install -g http-server
    ```

3. Serve the files using `http-server`:
    ```bash
    http-server .
    ```

4. Open your browser and go to `http://127.0.0.1:8080/space.html` to play the game.

## Game Modes

There are two game modes: **Manual** and **API**.

- **Manual Mode**: Control the player using the arrow keys on your keyboard.
- **API Mode**: The player moves based on a predefined set of moves fetched from a server.

## Controls

- **Arrow Keys**: Move the player up, down, left, or right.
- **Toggle Button**: Switch between Manual and API modes.

## Assets

The following assets are used in the game:

- **sun.png**: The player sprite.
- **blackhole.png**: The obstacle sprite.
- **mercury.png, venus.png, earth.png, mars.png, jupiter.png, saturn.png, uranus.png, neptune.png**: Planet sprites.
- **stars.jpg**: The background image.
- **restartButton.png**: The restart button sprite.
- **api.png**: The icon for API mode.
- **keyboard.png**: The icon for Manual mode.

## Technical Details

The game is built using the Phaser 3 framework. The game board is an 8x6 grid where each square is 100x100 pixels. The player starts at the top-left corner and must navigate to the bottom-right corner while collecting all the planets and avoiding obstacles.

### Key Functions

- `preload()`: Loads all the game assets.
- `create()`: Sets up the game scene, including the grid, obstacles, planets, and player.
- `update()`: Handles player movement and collision detection.
- `movePlayer()`: Moves the player based on input or API moves.
- `checkForFinish()`: Checks if the player has reached the finish line and collected all planets.
- `simulateApiMoves()`: Simulates the moves from the API mode.
- `fetchMovesFromServer()`: Fetches moves from a server for the API mode.


## Testing the API

You can use Postman to test the API and fetch moves from a server. The example moves are stored in the `public/moves.json` file.

1. Open Postman and create a new request.
2. Set the request type to `GET`.
3. Enter the URL to fetch the moves: `http://127.0.0.1:8080/moves.json`.
4. Send the request.
5. You should receive a response with the example moves.

The `moves.json` file contains the following structure:
```json
{
    "moves": ["ARROW_RIGHT", "ARROW_DOWN", "ARROW_RIGHT", "ARROW_DOWN", "ARROW_RIGHT", "ARROW_DOWN", "ARROW_RIGHT", "ARROW_DOWN"]
}

