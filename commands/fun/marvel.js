//require md5 module
var md5 = require('md5')
//require dotenv module
require('dotenv').config()
//require node-fetch module for fetch requests
const fetch = require('node-fetch')

module.exports = {
  name: 'marvel',
  cooldown: '10',
  description: 'call the marvel API for information',
  guildOnly: true,
  execute(message, args) {
    //set marvel public api key
    const MARVEL_PUBLIC_KEY = 'a82e67e91c1cb1e3e3827c0b70da6aac'

    const MARVEL_PRIVATE_KEY = process.env.MARVEL_PRIVATE_KEY

    //set characterName, will be inputted as argument
    var characterName = args[0]

    //create timestamp
    var ts = new Date().getTime()
    ts = ts.toString()

    //set hash as md5 of ts + private key + public key
    var stringToHash = ts + MARVEL_PRIVATE_KEY + MARVEL_PUBLIC_KEY
    var hash = md5(stringToHash)

    //set url to base url for character
    var url = `http://gateway.marvel.com/v1/public/characters?name=${characterName}&ts=${ts}`

    async function marvelFetch() {
      const data = await fetch(
        `${url + '&apikey=' + MARVEL_PUBLIC_KEY + '&hash=' + hash}`
      ).then((response) => response.json())

      message.channel.send(data.data.results[0].description)
    }

    marvelFetch()
  },
}
