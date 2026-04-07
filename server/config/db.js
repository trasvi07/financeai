const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    // Force IPv4 and use direct connection
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
      directConnection: false,
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB