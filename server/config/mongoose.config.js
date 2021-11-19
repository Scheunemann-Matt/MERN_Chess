const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/chess_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Established connection to the chess database'))
    .catch(err => console.log('Something went wrong when connecting to the chess database', err));