const express = require('express');
const app = express();
const cors = require('cors');
const port = 8000;
const ChessApp = require('./server/routes/game.routes');
require('./server/config/mongoose.config');
app.use(cors(), express.json(), express.urlencoded({extended: true}));

ChessApp(app);
app.listen(port, () => console.log(`Chess listening on port: ${port}`) );
