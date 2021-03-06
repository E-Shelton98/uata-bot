//require md5 module
var md5 = require('md5')
//require dotenv module
require('dotenv').config()
//require node-fetch module for fetch requests
const fetch = require('node-fetch')
//require MessageEmbed from discord.js module
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'info',
  cooldown: '1',
  description: 'call the marvel API for information',
  usage: `character name`,
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

    let characterName = args

    if (args.length > 1) {
      characterName = args.join('%20')
    }

    marvelFetchBio(characterName)

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

        //assume there isn't a description available
        let hasDescription = false
        //if there is a description...
        if (characterBio !== '') {
          //set hasDescription to true for the ternary at the embed
          hasDescription = true
        }

        //create embed as message to send.
        let embed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle(data.results[0].name)
          .setURL(characterWikiURL)
          .setThumbnail(characterImage)
          .setDescription(
            hasDescription ? characterBio : data.results[0].urls[1].url
          )

        message.channel.send(embed)
      } catch (err) {
        //if failed to find under exact name, try searching using nameStartsWith
        marvelFetchBioStartsWith(characterName)
      }
    }

    async function marvelFetchBioStartsWith(characterName) {
      //set url to base url for character
      let url = `http://gateway.marvel.com/v1/public/characters?nameStartsWith=${characterName}&ts=${ts}`

      try {
        const response = await fetch(
          `${url + '&apikey=' + MARVEL_PUBLIC_KEY + '&hash=' + hash}`
        )

        const { data } = await response.json()

        const characterImage = `${data.results[0].thumbnail.path}/standard_amazing.${data.results[0].thumbnail.extension}`
        const characterWikiURL = data.results[0].urls[1].url
        const characterBio = trim(data.results[0].description, 1024)

        let hasDescription = false
        if (characterBio !== '') {
          hasDescription = true
        }

        let embed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle(data.results[0].name)
          .setURL(characterWikiURL)
          .setThumbnail(characterImage)
          .setDescription(
            hasDescription ? characterBio : data.results[0].urls[1].url
          )

        message.channel.send(embed)
      } catch (err) {
        return message.reply(
          `I'm sorry, I can't find that entry in the database`
        )
      }
    }
  },
}
