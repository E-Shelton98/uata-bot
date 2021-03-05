//require md5 module
var md5 = require('md5')
//require dotenv module
require('dotenv').config()
//require node-fetch module for fetch requests
const fetch = require('node-fetch')
//require MessageEmbed from discord.js module
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'cover',
  cooldown: '3',
  description: 'call the marvel API for the cover of a comic',
  usage: 'issue title',
  guildOnly: true,
  execute(message, args) {
    //trim method to ensure information does cause an error for being too long on the embed
    function trim(str, max) {
      return str.length > max ? `${str.slice(0, max - 3)}...` : str
    }

    //set marvel public api key
    const MARVEL_PUBLIC_KEY = 'a82e67e91c1cb1e3e3827c0b70da6aac'

    const MARVEL_PRIVATE_KEY = process.env.MARVEL_PRIVATE_KEY

    //create timestamp
    var ts = new Date().getTime()
    ts = ts.toString()

    //set hash as md5 of ts + private key + public key
    var stringToHash = ts + MARVEL_PRIVATE_KEY + MARVEL_PUBLIC_KEY
    var hash = md5(stringToHash)

    //if searching for a specific comic issue...

    //set comicIssue
    let comicIssue = args[0]

    //set comicTitle
    let comicTitle = args.splice(1)
    comicTitle = comicTitle.join('%20')

    marvelFetchCover(comicTitle, comicIssue)

    async function marvelFetchCover(comicTitle, comicIssue) {
      //set url to base url for comic
      let url = `http://gateway.marvel.com/v1/public/comics?title=${comicTitle}&issueNumber=${comicIssue}&ts=${ts}`

      try {
        const response = await fetch(
          `${url + '&apikey=' + MARVEL_PUBLIC_KEY + '&hash=' + hash}`
        )

        const data = await response.json()

        const comicDetailURL = data.data.results[0].urls[0].url
        const comicImage = `${data.data.results[0].images[0].path}.${data.data.results[0].images[0].extension}`

        const embed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle(data.data.results[0].title)
          .setURL(comicDetailURL)
          .setImage(comicImage)

        message.channel.send(embed)
      } catch (err) {
        console.log(err)
        return message.reply(
          `I'm sorry, I can't find that entry in the database.`
        )
      }
    }
  },
}
