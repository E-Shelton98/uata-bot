module.exports = {
  name: 'prune',
  description: 'prune messages from a channel.',
  execute(message, args) {
    //get the prune amount based off of the number given as the first argument
    const amount = parseInt(args[0] + 1)

    //if amount is not a number...
    if (isNaN(amount)) {
      //reply with "that doesn't seem to be a valid number."
      return message.reply("that doesn't seem to be a valid number.")
    }
    //if amount is LESS THAN 1 or GREATER THAN 99...
    else if (amount <= 1 || amount > 100) {
      //reply with "you need to input a number between 1 and 99."
      return message.reply('you need to input a number between 1 and 99.')
    }
    //if the amount IS a number AND is between 1 and 99
    else {
      //bulk delete messages INCLUDING those older than 2 weeks.
      message.channel.bulkDelete(amount, true).catch((err) => {
        //if there is an error catch it, and send "there was an error trying to prune messages in this channel!"
        console.error(err)
        message.channel.send(
          'there was an error trying to prune messages in this channel!'
        )
      })
    }
  },
}
