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

//retrieve command folders
const commandFolders = fs.readdirSync('./commands')
//loop through command folders...
for (const folder of commandFolders) {
  //retrieve command files, filter for only those that end with .js file type.
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith('.js'))

  //loop through commandFiles...
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`)

    //set a new item in the Collection
    //with the key as the command name and the value as the exported module
    client.commands.set(command.name, command)
  }
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
  //set constant commandName to be the args shifted, and set toLowerCase to ensure matching.
  const commandName = args.shift().toLowerCase()

  //if the client DOES NOT have that command, exit.
  if (!client.commands.has(commandName)) return

  //set const command to equal the client command.
  const command = client.commands.get(commandName)

  if (command.args && !args.length) {
    return message.channel.send(
      `This command requires arguments, ${message.author}!`
    )
  }

  //if the command does exist, execute it, and pass the message and args to the execution...
  try {
    command.execute(message, args)
  } catch (error) {
    //if there is an error when executing, log the error, and reply "there was an error trying to execute that command"
    console.error(error)
    message.reply('there was an error trying to execute that command!')
  }
})

//login to Discord with your app's token
client.login(process.env.DISCOPOLY_TOKEN)
