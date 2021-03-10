//require md5 module
var md5 = require('md5')
if (process.env.NODE_ENV === 'development') {
  //require custom-env for multiple .env files support
  require('custom-env').env(true)
  //require dotenv module
  require('dotenv').config()
}
//require node-fetch module for fetch requests
const fetch = require('node-fetch')
//require MessageEmbed from discord.js module
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: '1st',
  cooldown: '1',
  description: 'get a characters first comic appearance',
  usage: `u! 1st [character name]`,
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

    let characterName = args
    console.log(characterName)

    if (args.length > 1) {
      characterName = args.join('%20')
    }

    marvelFetchID(characterName)

    async function marvelFetchID(characterName) {
      //set url to base url for character
      let url = `http://gateway.marvel.com/v1/public/characters?name=${characterName}&ts=${ts}`

      try {
        const response = await fetch(
          `${url + '&apikey=' + MARVEL_PUBLIC_KEY + '&hash=' + hash}`
        )

        const { data } = await response.json()

        const characterID = data.results[0].id

        marvelFetchFirstAppearance(characterID)
      } catch (err) {
        //if failed to find under exact name, try searching using nameStartsWith
        message.reply(
          `I can't find a character with that name, I'll search names that start with that instead...`
        )
        marvelFetchIDStartsWith(characterName)
      }
    }

    async function marvelFetchIDStartsWith(characterName) {
      //set url to base url for character
      let url = `http://gateway.marvel.com/v1/public/characters?nameStartsWith=${characterName}&ts=${ts}`

      try {
        const response = await fetch(
          `${url + '&apikey=' + MARVEL_PUBLIC_KEY + '&hash=' + hash}`
        )

        const { data } = await response.json()

        const characterID = data.results[0].id

        marvelFetchFirstAppearance(characterID)
      } catch (err) {
        console.log(message.content, err)
        return message.reply(
          `I'm sorry, I can't find that entry in the database`
        )
      }
    }

    async function marvelFetchFirstAppearance(characterID) {
      //set url for fetch request
      let firstURL = `https://gateway.marvel.com/v1/public/characters/${characterID}/comics?noVariants=true&orderBy=-onsaleDate&apikey=${MARVEL_PUBLIC_KEY}&ts=${ts}&hash=${hash}`

      try {
        let response = await fetch(firstURL)
        const totalData = await response.json()

        const total = totalData.data.total
        //for finding the earliest dated comic
        let limit = 100
        let offset = total - limit

        let secondURL = `https://gateway.marvel.com/v1/public/characters/${characterID}/comics?noVariants=true&orderBy=-onsaleDate&apikey=${MARVEL_PUBLIC_KEY}&offset=${offset}&limit=${limit}&ts=${ts}&hash=${hash}`

        response = await fetch(secondURL)
        const { data } = await response.json()

        let popped = 0
        while (
          data.results[data.results.length - 1].dates[0].date ===
            '-0001-11-30T00:00:00-0500' &&
          popped < limit
        ) {
          console.log(data.results.length)
          data.results.pop()
          popped++
        }

        const comicDetailURL =
          data.results[data.results.length - 1].urls[0].url
        const comicImage = `${
          data.results[data.results.length - 1].images[0].path
        }.${
          data.results[data.results.length - 1].images[0].extension
        }`

        const embed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle(data.results[data.results.length - 1].title)
          .setURL(comicDetailURL)
          .setImage(comicImage)

        message.channel.send(embed)
      } catch (err) {
        console.log(message.content, err)
        return message.reply(`I'm sorry, I can't find that in the database.`)
      }
    }
  },
}
