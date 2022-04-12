const { prefix } = require('../../config.json')

module.exports = {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  aliases: ['commands', 'info'],
  usage: '<command name>',
  cooldown: '5',
  execute(message, args) {
    const data = []
    const { commands } = message.client

    if (args.length === 0) {
      data.push("Here's a list of all my commands:")
      data.push(commands.map((command) => command.name).join(', '))
      data.push(
        `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`
      )

      return message.author
        .send(data, { split: true })
        .then(() => {
          if (message.channel.type === 'dm') return
          message.reply("I've sent you a DM with all my commands!")
        })
        .catch((error) => {
          console.error(
            `Could not send help DM to ${message.author.tag}.\n`,
            error
          )
          message.reply(
            "It seems like I can't DM you! Do you have DMs disabled?"
          )
        })
    }

    else if (args[0] !== 'pin') {
      //get name of command that user needs help with
      const name = args[0].toLowerCase()
      
      //set command to name, or find a matching alias
      const command =
        commands.get(name) ||
        commands.find((cmd) => cmd.aliases && cmd.aliases.includes(name))

      //if the command doesn't exist...
      if (!command) {
        //return reply of "That's not a valid command!"
        return message.reply("That's not a valid command!")
      }

      //push command name into data array
      data.push(`**Name:** ${command.name}`)

      //if the command has an alias, push aliases into data array
      if (command.aliases)
        data.push(`**Aliases:** ${command.aliases.join(', ')}`)
      //if the command has a description, push description into data array
      if (command.description)
        data.push(`**Description:** ${command.description}`)
      //if command has an outlined usage, push usage into data array
      if (command.usage)
        data.push(`**Usage:** ${command.usage}`)

      //push command's cooldown, or global cooldown into data array
      data.push(`**Cooldown:**: ${command.cooldown || 3} second(s)`)
    }

    //if command is help pin, create an embed that can be read and closed.
    else if (args[0] === 'pin') {
    commands.forEach((cmd) => {
      //push command name into data array
      data.push(`**Name:** ${cmd.name}`)

      //if the command has an alias, push aliases into data array
      if (cmd.aliases) data.push(`**Aliases:** ${cmd.aliases.join(', ')}`)
      //if the command has a description, push description into data array
      if (cmd.description) data.push(`**Description:** ${cmd.description}`)
      //if command has an outlined usage, push usage into data array
      if (cmd.usage) data.push(`**Usage:** ${prefix}${cmd.name} ${cmd.usage}`)

      //push command's cooldown, or global cooldown into data array
      data.push(`**Cooldown:**: ${cmd.cooldown || 3} second(s)`)
    })
    //send message of joined data with split paramater set to true for pagination.
    
    
  }
  message.channel.send(data, { split: true })
  },
}
