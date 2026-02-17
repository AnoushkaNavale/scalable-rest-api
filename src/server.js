require('dotenv').config();
const app = require('./app');

const port = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
