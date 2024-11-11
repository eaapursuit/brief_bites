const app = require('./app');
require('dotenv').config();
const port = process.env.PORT || 3005;

app.listen(port, () => console.log(`Server listening on port ${port}`));