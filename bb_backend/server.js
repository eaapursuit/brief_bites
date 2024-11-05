const app = require('./app.js');

// CONFIGURATION
require('dotenv').config();
const port = process.env.PORT || 3005;

// LISTEN
app.listen(port, () => console.log(`Server listening on port ${port}`));