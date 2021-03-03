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
const cooldowns = new Discord.Collection()
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

  //set command to commandName or search command aliases for commandName
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    )

  //if command does not exist, exit.
  if (!command) return

  if (command.guildOnly && message.channel.type === 'dm') {
    return message.reply("I can't execute that command inside DMs!")
  }

  //if command has permission restrictions...
  if (command.permissions) {
    //set authorPerms to the channel permissions for that author.
    const authorPerms = message.channel.permissionsFor(message.author)
    //if no permissions, or the author doesn't have the command permissions...
    if (!authorPerms || !authorPerms.has(command.permissions)) {
      //reply with "I can't let you do that {author}"
      return message.send(`I can't let you do that ${message.author}`)
    }
  }

  //if the command requires arguments, and there are none...
  if (command.args && !args.length) {
    //set reply to "You didn't provide any arguments, {author}"
    let reply = `You didn't provide any arguments, ${message.author}!`
    //if command has outlined usage...
    if (command.usage) {
      //set reply to previous PLUS "\nThe proper usage would be {prefix command usage}"
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``
    }
    //return as message to channel reply
    return message.channel.send(reply)
  }

  //if Cooldowns DOES NOT have an entry for the command being used...
  if (!cooldowns.has(command.name)) {
    //set an entry for the command being used, and create a new collection
    cooldowns.set(command.name, new Discord.Collection())
  }

  //set now to the current date
  const now = Date.now()
  //set timestamps to be the cooldowns of that command
  const timestamps = cooldowns.get(command.name)
  //set cooldown amount to the amount specified in seconds OR 3 seconds.
  const cooldownAmount = (command.cooldown || 3) * 1000

  //if timestamps has the author id...
  if (timestamps.has(message.author.id)) {
    //set expiration time to the timestamp + cooldownAmount
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount

    //if now is LESS THAN expiration time...
    if (now < expirationTime) {
      //set timeLeft to expirationTime - now in seconds.
      const timeLeft = (expirationTime - now) / 1000
      //return a reply of "please wait {timeLeft} more second(s) before reusing the {command} command."
      return message.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`
      )
    }
  }

  //delete the entry for the message author under the command after the cooldown has expired.
  timestamps.set(message.author.id, now)
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

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
