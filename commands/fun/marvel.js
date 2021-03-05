//require md5 module
var md5 = require('md5')
//require dotenv module
require('dotenv').config()
//require node-fetch module for fetch requests
const fetch = require('node-fetch')
//require MessageEmbed from discord.js module
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'marvel',
  cooldown: '10',
  description: 'call the marvel API for information',
  usage: `(bio character) OR (comic issue title)`,
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

    //if searching for a character...
    if (args[0] === 'bio') {
      //set characterName
      let characterName = args.shift()
      characterName = args.join('%20')

      marvelFetchBio(characterName)
    }
    //if searching for a specific comic issue...
    else if (args[0] === 'comic') {
      //set comicIssue
      let comicIssue = args[1]

      //set comicTitle
      let comicTitle = args.splice(2)
      comicTitle = comicTitle.join('%20')

      marvelFetchComic(comicTitle, comicIssue)
    }

    //async function marvelFetchExploratory {}

    async function marvelFetchBio(characterName) {
      //set url to base url for character
      let url = `http://gateway.marvel.com/v1/public/characters?name=${characterName}&ts=${ts}`

      try {
        const response = await fetch(
          `${url + '&apikey=' + MARVEL_PUBLIC_KEY + '&hash=' + hash}`
        )
        const { data } = await response.json()

        const characterImage = `${data.results[0].thumbnail.path}/standard_amazing.${data.results[0].thumbnail.extension}`
        const characterWikiURL = data.results[0].urls[1].url
        const characterBio = trim(data.results[0].description, 1024)

        const embed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle(data.results[0].name)
          .setURL(characterWikiURL)
          .setThumbnail(characterImage)
          .addFields({
            name: 'bio',
            value: characterBio,
          })

        message.channel.send(embed)
      } catch (err) {
        return message.reply(
          `I'm sorry, I can't find that entry in the database`
        )
      }
    }

    async function marvelFetchComic(comicTitle, comicIssue) {
      //set url to base url for character
      let url = `http://gateway.marvel.com/v1/public/comics?title=${comicTitle}&issueNumber=${comicIssue}&ts=${ts}`

      try {
        const response = await fetch(
          `${url + '&apikey=' + MARVEL_PUBLIC_KEY + '&hash=' + hash}`
        )

        const {data} = await response.json()

        const comicDetailURL = data.results[0].urls[0].url
        const comicImage = `${data.results[0].images[0].path}.${data.results[0].images[0].extension}`

        const embed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle(data.results[0].title)
          .setURL(comicDetailURL)
          .setThumbnail(comicImage)
          .addFields({
            name: 'description',
            value: trim(data.results[0].description, 1024),
          })

        message.channel.send(embed)
        message.channel.send(comicImage)
      } catch (err) {
          return message.reply(
            `I'm sorry, I can't find that entry in the database.`)
      }
      
    }
  },
}
