const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet')
const cors = require('cors')
const app = express();

connectDB();

app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));

app.use(cors())
app.use(helmet())

// Log API Requests
app.use(morgan('common'));

//*****************DEFINED API ROUTES********************//
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/projects', require('./routes/project'));

// Handle production environment 
// if (process.env.NODE_ENV === 'production'){
//     app.use(express.static('client/build'))
//     app.get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname,'client','build','index.html'))
//     })
// }


const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})