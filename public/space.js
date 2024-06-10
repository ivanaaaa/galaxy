var config = {
    type: Phaser.AUTO,
    width: 910,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var squareSize = 100; // Size of each square
var boardWidth = 8; // Number of squares horizontally
var boardHeight = 6; // Number of squares vertically
var player;
var cursors;
var obstacles = [];
var planets = [];
var collectedPlanets = [];
var graphics;
var moveCooldown = false;
var gameFinished = false;
var mode = 'manual'; // Default mode is manual
var apiMoves = []; // Queue for API moves
var currentApiMoveIndex = 0;
var movesText; // Text element to display API moves
var toggleButton;

function preload() {
    this.load.image('sun', 'assets/sun.png');
    this.load.image('blackhole', 'assets/blackhole.png');
    this.load.image('mercury', 'assets/mercury.png');
    this.load.image('venus', 'assets/venus.png');
    this.load.image('earth', 'assets/earth.png');
    this.load.image('mars', 'assets/mars.png');
    this.load.image('jupiter', 'assets/jupiter.png');
    this.load.image('saturn', 'assets/saturn.png');
    this.load.image('uranus', 'assets/uranus.png');
    this.load.image('neptune', 'assets/neptune.png');
    this.load.image('galaxy', 'assets/galaxy.png');
    this.load.image('restartButton', 'assets/restartButton.png');
    this.load.image('background', 'assets/stars.jpg');
    this.load.image('api', 'assets/api.png'); // API mode icon
    this.load.image('keyboard', 'assets/keyboard.png'); // Manual mode icon
}

function create() {
    // Create the background
    this.cameras.main.setBackgroundColor('#ffffff');

    // Draw the grid and obstacles
    graphics = this.add.graphics();
    drawGrid(this);
    createObstacles(this);
    createPlanets(this);
    createFinishLineBorder(this);

    // Create the player (sun)
    player = this.add.sprite(squareSize / 2, squareSize / 2, 'sun');
    player.setDisplaySize(squareSize, squareSize);

    // Set up keyboard input
    cursors = this.input.keyboard.createCursorKeys();

    // Add a toggle button to switch between manual and API modes
    toggleText = this.add.text(805, 5, 'Change game\n'+'mode here:\n', { fontSize: '16px', fill: '#000000', align: 'left', wordWrap: { width: 200, useAdvancedWrap: true } });
    toggleButton = this.add.sprite(840, 60, 'api');
    toggleButton.setDisplaySize(80, 80);
    toggleButton.setInteractive();
    toggleButton.on('pointerdown', function () {
        mode = (mode === 'manual') ? 'api' : 'manual';
        toggleButton.setTexture(mode === 'manual' ? 'api' : 'keyboard');
        console.log('Mode switched to', mode);

        // Fetch moves if switching to API mode
        if (mode === 'api') {
            fetchMovesFromServer();
        }
    });

    // Add text element to display API moves
    movesText = this.add.text(805, 90, 'API Moves:\n', { fontSize: '16px', fill: '#000000', align: 'left', wordWrap: { width: 200, useAdvancedWrap: true } });

    // Check if mode is 'api' and initiate the move simulation
    if (mode === 'api' && apiMoves.length > 0) {
        currentApiMoveIndex = 0;
        simulateApiMoves(this);
    }
}

function update() {
    if (!moveCooldown && !gameFinished) {
        if (mode === 'manual') {
            if (cursors.left.isDown) {
                movePlayer(-1, 0, this);
            } else if (cursors.right.isDown) {
                movePlayer(1, 0, this);
            } else if (cursors.up.isDown) {
                movePlayer(0, -1, this);
            } else if (cursors.down.isDown) {
                movePlayer(0, 1, this);
            }
        } else if (mode === 'api' && currentApiMoveIndex < apiMoves.length) {
            const move = apiMoves[currentApiMoveIndex];
            currentApiMoveIndex++;
            if (move === 'ARROW_LEFT') {
                movePlayer(-1, 0, this);
            } else if (move === 'ARROW_RIGHT') {
                movePlayer(1, 0, this);
            } else if (move === 'ARROW_UP') {
                movePlayer(0, -1, this);
            } else if (move === 'ARROW_DOWN') {
                movePlayer(0, 1, this);
            }
            updateMovesText(); // Update the displayed moves
        }
    }
}

function drawGrid(scene) {
    graphics.lineStyle(1, 0x000000, 1);

    // Draw horizontal lines
    for (var y = 0; y <= boardHeight; y++) {
        graphics.moveTo(0, y * squareSize);
        graphics.lineTo(boardWidth * squareSize, y * squareSize);
    }

    // Draw vertical lines
    for (var x = 0; x <= boardWidth; x++) {
        graphics.moveTo(x * squareSize, 0);
        graphics.lineTo(x * squareSize, boardHeight * squareSize);
    }

    graphics.strokePath();

    // Draw green border for start and end points
    graphics.lineStyle(4, 0x00FF00, 1);

    // Starting point (left border green)
    graphics.strokeRect(0, 0, squareSize, squareSize);
    graphics.beginPath();
    graphics.moveTo(0, 0);
    graphics.lineTo(0, squareSize);
    graphics.strokePath();

    // Ending point (right border green)
    graphics.strokeRect((boardWidth - 1) * squareSize, (boardHeight - 1) * squareSize, squareSize, squareSize);
    graphics.beginPath();
    graphics.moveTo((boardWidth) * squareSize, (boardHeight - 1) * squareSize);
    graphics.lineTo((boardWidth) * squareSize, (boardHeight) * squareSize);
    graphics.strokePath();
}


function createObstacles(scene) {
    var obstacleCoordinates = [
        { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 },
        { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 3 },
        { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }
    ];

    obstacles.forEach(obstacle => obstacle.destroy()); // Destroy old obstacles
    obstacles = []; // Clear the obstacles array

    obstacleCoordinates.forEach(function(coord) {
        var obstacle = scene.add.sprite(coord.x * squareSize + squareSize / 2, coord.y * squareSize + squareSize / 2, 'blackhole');
        obstacle.setDisplaySize(squareSize, squareSize);
        obstacles.push(obstacle);
    });
}

function createPlanets(scene) {
    var planetCoordinates = [
        { x: 2, y: 0, key: 'mercury' }, { x: 2, y: 4, key: 'venus' }, { x: 4, y: 0, key: 'earth' }, { x: 4, y: 4, key: 'mars' },
        { x: 5, y: 1, key: 'jupiter' }, { x: 5, y: 2, key: 'saturn' }, { x: 6, y: 0, key: 'uranus' }, { x: 6, y: 2, key: 'neptune' }
    ];

    planets.forEach(planet => planet.destroy()); // Destroy old planets
    planets = []; // Clear the planets array

    planetCoordinates.forEach(function(coord) {
        var planet = scene.add.sprite(coord.x * squareSize + squareSize / 2, coord.y * squareSize + squareSize / 2, coord.key);
        planet.setDisplaySize(squareSize, squareSize);
        planets.push(planet);
    });
}

function createFinishLineBorder(scene) {
    graphics.lineStyle(4, 0x00FF00, 1);
    graphics.strokeRect((boardWidth - 1) * squareSize, (boardHeight - 1) * squareSize, squareSize, squareSize);
}

function isObstacle(x, y) {
    return obstacles.some(function(obstacle) {
        return obstacle.x === x && obstacle.y === y;
    });
}

function checkForPlanetCollision(scene) {
    var playerGridX = Math.floor(player.x / squareSize);
    var playerGridY = Math.floor(player.y / squareSize);

    planets = planets.filter(function(planet) {
        var planetGridX = Math.floor(planet.x / squareSize);
        var planetGridY = Math.floor(planet.y / squareSize);

        if (playerGridX === planetGridX && playerGridY === planetGridY) {
            collectedPlanets.push(planet);
            planet.destroy();
            return false;
        }
        return true;
    });
}

function showEndScreen(scene, key, message) {
    var endScreen = scene.add.sprite(config.width / 2, config.height / 2, key);
    endScreen.setDisplaySize(config.width, config.height);
    var endMessage = scene.add.text(config.width / 2, config.height / 2 - 100, message, { fontSize: '64px', fill: '#ffffff', fontFamily: 'strong' });
    endMessage.setOrigin(0.5);

    // Add restart button
    var restartButton = scene.add.sprite(config.width / 2, config.height / 2 + 100, 'restartButton');
    restartButton.setDisplaySize(100, 100);
    restartButton.setInteractive();
    restartButton.on('pointerdown', function () {
        resetGameVariables();
        scene.scene.restart();
    });
    // Center the elements
    endMessage.setOrigin(0.5);
    restartButton.setOrigin(0.5);
}

function resetGameVariables() {
    gameFinished = false;
    moveCooldown = false;
    collectedPlanets = [];
    apiMoves = [];
    currentApiMoveIndex = 0;
    mode = 'manual'; // Reset mode to manual
    if (toggleButton) {
        toggleButton.setTexture('api');
    }
}

function activateMoveCooldown() {
    moveCooldown = true;
    setTimeout(() => {
        moveCooldown = false;
    }, 200); // Adjust the delay as needed (in milliseconds)
}

function simulateApiMoves(scene) {
    if (currentApiMoveIndex < apiMoves.length) {
        var move = apiMoves[currentApiMoveIndex];
        currentApiMoveIndex++;
        if (move === 'ARROW_RIGHT') {
            movePlayer(1, 0, scene);
        } else if (move === 'ARROW_LEFT') {
            movePlayer(-1, 0, scene);
        } else if (move === 'ARROW_UP') {
            movePlayer(0, -1, scene);
        } else if (move === 'ARROW_DOWN') {
            movePlayer(0, 1, scene);
        }
        setTimeout(() => simulateApiMoves(scene), 200);
    } else {
        // Check if all planets are collected
        if (collectedPlanets.length !== 8) {
            gameFinished = true;
            showEndScreen(scene, 'background', 'Oh No! You failed!');
        }
    }
}
function checkForFinish(scene) {
    var tolerance = 50; // Adjust this value as needed
    var finalX = (boardWidth ) * squareSize;
    var finalY = (boardHeight) * squareSize;

    if (Math.abs(player.x - finalX) <= tolerance && Math.abs(player.y - finalY) <= tolerance) {
        if (collectedPlanets.length === 8) {
            gameFinished = true;
            showEndScreen(scene, 'background', 'Well Done!');
        } else {
            gameFinished = true;
            showEndScreen(scene, 'background', 'Oh No! You failed!');
        }
    }
}

function movePlayer(deltaX, deltaY, scene) {
    if (gameFinished) return;

    var newX = player.x + deltaX * squareSize;
    var newY = player.y + deltaY * squareSize;

    if (newX >= 0 && newX < boardWidth * squareSize && newY >= 0 && newY < boardHeight * squareSize && !isObstacle(newX, newY)) {
        player.x = newX;
        player.y = newY;
        checkForPlanetCollision(scene);
        checkForFinish(scene); // Check for finish after moving the player
    }

    activateMoveCooldown();
}

function fetchMovesFromServer() {
    fetch('/api/moves')
        .then(response => response.json())
        .then(data => {
            apiMoves = data.moves;
            currentApiMoveIndex = 0;
            updateMovesText(); // Update the displayed moves
            simulateApiMoves(game.scene.scenes[0]);
        })
        .catch(error => console.error('Error fetching moves:', error));
}

function updateMovesText() {
    if (movesText) {
        movesText.setText('API Moves:\n' + apiMoves.map(move => {
            switch (move) {
                case 'ARROW_LEFT':
                    return '<-';
                case 'ARROW_RIGHT':
                    return '->';
                case 'ARROW_UP':
                    return '↑';
                case 'ARROW_DOWN':
                    return '↓';
                default:
                    return '';
            }
        }).join('\n'));
    }
}
