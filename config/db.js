const mongoose = require('mongoose');

const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then((conn) => {
      console.log(`✅ Database connected: ${conn.connection.host}`);
    })
    .catch((err) => {
      console.error(`❌ Database Error: ${err}`);
      process.exit(1);
    });
};

module.exports = connectDB;
