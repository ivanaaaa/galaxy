const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let apiMoves = [];
let mode = 'manual';

app.post('/api/moves', (req, res) => {
    const moves = [];
    if (req.body.singlesign) {
        moves.push(req.body.singlesign.sign);
    }
    if (req.body.loopsign) {
        for (let i = 0; i < req.body.loopsign.cycles; i++) {
            req.body.loopsign.children.forEach(child => {
                moves.push(child.sign);
            });
        }
    }
    apiMoves = moves;
    mode = 'api';
    res.send('Moves received');
});

app.get('/api/moves', (req, res) => {
    res.json({ moves: apiMoves });
});

app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
});
