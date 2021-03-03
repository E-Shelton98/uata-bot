module.exports = {
    name: 'kick',
    description: 'attempt to kick the mentioned user (in development)',
    guildOnly: true,
    permissions: 'KICK_MEMBERS',
    execute(message, args) {
      //grab the "first" mentioned user from the message
      //this will return a 'User' object, just like `message.author`

      //if there is NOT a mentioned user, reply "you need to tag a user in order to kick them!"
      if (!message.mentions.users.size) {
        return message.reply('you need to tag a user in order to kick them!')
      }
      //set taggedUser to be the first user tagged in the command message.
      const taggedUser = message.mentions.users.first()
      //send message stating "You wanted to kick {taggedUser}"
      message.channel.send(`You wanted to kick: ${taggedUser.username}`)
    }
}