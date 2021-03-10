//require fs module
const fs = require('fs')

//require dotenv module
require('dotenv').config()
require('custom-env').env(true)
//require discord.js module
const Discord = require('discord.js')

////////////////////////////////////////////////////////////////////
//https://codeburst.io/node-js-best-practices-smarter-ways-to-manage-config-files-and-variables-893eef56cbef

//module variables
const config = require('./config.json')
const defaultConfig = config.development
const environment = process.env.NODE_ENV
const environmentConfig = config[environment]
const finalConfig = { ...defaultConfig, ...environmentConfig }

global.gConfig = finalConfig
const prefix = gConfig.prefix
////////////////////////////////////////////////////////////////////

//create a new Discord client
const client = new Discord.Client()
//create new cooldowns collection
const cooldowns = new Discord.Collection()
//create new commands collection
client.commands = new Discord.Collection()

///////////////////////////////////////////////////////////////////////////////
//retrieve event files
const eventFiles = fs
  .readdirSync('./events')
  .filter((file) => file.endsWith('.js'))

for (const file of eventFiles) {
  const event = require(`./events/${file}`)

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client))
  } else {
    client.on(event.name, (...args) =>
      event.execute(...args, prefix, cooldowns, client)
    )
  }
}

///////////////////////////////////////////////////////////////////////////////

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

//listen for messages in the server.

//login to Discord with your app's token
client.login(process.env.UATU_TOKEN)
