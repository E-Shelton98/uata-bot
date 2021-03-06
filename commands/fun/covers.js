//require md5 module
var md5 = require('md5')
//require dotenv module
require('dotenv').config()
//require node-fetch module for fetch requests
const fetch = require('node-fetch')
//require MessageEmbed from discord.js module
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'covers',
  cooldown: '3',
  description: 'call the marvel API for the cover of a comic',
  usage: 'issue title',
  guildOnly: true,
  execute(message, args) {
    //set marvel public api key
    const MARVEL_PUBLIC_KEY = 'a82e67e91c1cb1e3e3827c0b70da6aac'

    const MARVEL_PRIVATE_KEY = process.env.MARVEL_PRIVATE_KEY

    //create timestamp
    var ts = new Date().getTime()
    ts = ts.toString()

    //set hash as md5 of ts + private key + public key
    var stringToHash = ts + MARVEL_PRIVATE_KEY + MARVEL_PUBLIC_KEY
    var hash = md5(stringToHash)

    //set comicIssue
    let comicIssue = args[args.length - 1]
    //set comicTitle
    let comicTitle = args.slice(0, -1)
    comicTitle = comicTitle.join('%20')

    marvelFetchCover(comicTitle, comicIssue)

    async function marvelFetchCover(comicTitle, comicIssue) {
      //set url to base url for comic
      let url = `http://gateway.marvel.com/v1/public/comics?noVariants=true&title=${comicTitle}&issueNumber=${comicIssue}&ts=${ts}`

      try {
        const response = await fetch(
          `${url + '&apikey=' + MARVEL_PUBLIC_KEY + '&hash=' + hash}`
        )

        const data = await response.json()

        const comicDetailURL =
          data.data.results[data.data.results.length - 1].urls[0].url
        const comicImage = `${
          data.data.results[data.data.results.length - 1].images[0].path
        }.${
          data.data.results[data.data.results.length - 1].images[0].extension
        }`

        const embed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle(data.data.results[data.data.results.length - 1].title)
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
