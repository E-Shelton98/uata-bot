module.exports = {
  name: 'server',
  description: 'display server name and users',
  execute(message, args) {
    message.reply(
      //reply server information to message sender
      `This server's name is: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`
    )
  },
}
