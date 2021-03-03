module.exports = {
  name: 'avatar',
  description: 'display avatar of message sender/or mentioned users.',
  execute(message, args) {
    //if no users are mentioned display command sender's avatar.
    if (!message.mentions.users.size) {
      return message.channel.send(
        `Your avatar: ${message.author.displayAvatarURL({
          format: 'png',
          dynamic: true,
        })}`
      )
    }

    //if users are mentioned, map over all mentioned users, and set responses to array avatarList
    const avatarList = message.mentions.users.map((user) => {
      return `${user.username}'s avatar: ${user.displayAvatarURL({
        format: 'png',
        dynamic: true,
      })}`
    })

    //send the entire array of strings as a message
    //by default, discord.js will ".join()" the array with '\n'
    message.channel.send(avatarList)
  },
}
