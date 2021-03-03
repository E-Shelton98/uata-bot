module.exports = {
  name: 'ping',
  description: "Ping me to check if I'm on",
  execute(message, args) {
    //reply "Pong." to the sender in response to the ping.
    message.reply('Pong.')
  },
}
