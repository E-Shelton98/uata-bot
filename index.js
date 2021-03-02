//require dotenv module
require('dotenv').config()

//require discord.js module
const Discord = require('discord.js')

//require config file
const { prefix } = require('./config.json')

//create a new Discord client
const client = new Discord.Client()

//when the client is ready, run this code
//this event will only trigger one time after logging in
client.once('ready', () => {
  console.log('Ready!')
})

client.on('message', (message) => {
  if (message.content == '!Ping') {
    //send back "Pong!" to the channel the message was sent in
    message.channel.send('Pong!')
  }
})

//login to Discord with your app's token
client.login(process.env.DISCOPOLY_TOKEN)
