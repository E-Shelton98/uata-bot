//require fs module
const fs = require('fs')

//require dotenv module
require('dotenv').config()

//require discord.js module
const Discord = require('discord.js')

//require config file
const { prefix } = require('./config.json')

//create a new Discord client
const client = new Discord.Client()
client.commands = new Discord.Collection()

//retrieve command files, filter for only those that end with .js file type.
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'))

//loop through commandFiles...
for (const file of commandFiles) {
  const command = require(`./commands/${file}`)

  //set a new item in the Collection
  //with the key as the command name and the value as the exported module
  client.commands.set(command.name, command)
}

//when the client is ready, run this code
//this event will only trigger one time after logging in
client.once('ready', () => {
  console.log('Ready!')
})

//listen for messages in the server.
client.on('message', (message) => {
  //if the message does not start with the prefix, ignore it.
  if (!message.content.startsWith(prefix) || message.author.bot) return

  //set constant args to be the message content minus the prefix, and split by spacing.
  const args = message.content.slice(prefix.length).trim().split(/ +/)
  //set constant command to be the args shifted, and set toLowerCase to ensure matching.
  const command = args.shift().toLowerCase()

  //if the command was "ping"...
  if (command === 'ping') {
    //send back "Pong!" to the channel the message was sent in
    client.commands.get('ping').execute(message, args)
  }
  //if the command was "server"...
  else if (command === 'server') {
    //reply with the server's name and total members
    client.commands.get('server').execute(message, args)
  }
  //if the command was "kick"...
  else if (command === 'kick') {
    //attempt to kick the mentioned person (in development)
    client.commands.get('kick').execute(message, args)
  }
  //if the command was "avatar"...
  else if (command === 'avatar') {
    //display senders or mentions avatar's
    client.commands.get('avatar').execute(message, args)
  }
  //if the command was "prune"...
  else if (command === 'prune') {
    //prune between 2 and 100 messages if allowed
    client.commands.get('prune').execute(message, args)
  }
})

//login to Discord with your app's token
client.login(process.env.DISCOPOLY_TOKEN)
