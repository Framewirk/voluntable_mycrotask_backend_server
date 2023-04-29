const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_CONN,{
    useNewUrlParser: true,
    serverSelectionTimeoutMS: 1000,
    dbName: process.env.MONGO_DB
    
}).then(() => {
    console.log("MongoDB Connected")
}).catch((err) => console.log(err.message))

mongoose.connection.on('connected', () => {
    console.log('Mongoose Connected')
})

mongoose.connection.on('error', (err) => {
    console.log(err.message)
})

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose Disconnected')
})

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
})