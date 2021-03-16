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
    //This command is very slow right now, will need to be reworked in the future, possibly going to make my own API.
    //set marvel public api key
    const MARVEL_PUBLIC_KEY = 'a82e67e91c1cb1e3e3827c0b70da6aac'

    const MARVEL_PRIVATE_KEY = process.env.MARVEL_PRIVATE_KEY

    //create timestamp
    var ts = new Date().getTime()
    ts = ts.toString()

    //set hash as md5 of ts + private key + public key
    var stringToHash = ts + MARVEL_PRIVATE_KEY + MARVEL_PUBLIC_KEY
    var hash = md5(stringToHash)

    //get characterName from args
    let characterName = args

    //if there are multiple words in the characterName join them for the url
    if (args.length > 1) {
      characterName = args.join('%20')
    }

    //fetch the ID of the character
    marvelFetchID(characterName)

    async function marvelFetchID(characterName) {
      //set url to base url for character
      let url = `http://gateway.marvel.com/v1/public/characters?name=${characterName}&ts=${ts}`

      //try to get a response
      try {
        const response = await fetch(
          `${url + '&apikey=' + MARVEL_PUBLIC_KEY + '&hash=' + hash}`
        )

        //extrapolate data from the response as json.
        const { data } = await response.json()

        //set characterID based on the response data.
        const characterID = data.results[0].id

        //pass the characterID to the FirstAppearance function
        marvelFetchFirstAppearance(characterID)
      } catch (err) {
        //if failed to find under exact name, try searching using nameStartsWith
        message.channel.send(
          `I can't find a character with that name, I'll search names that start with that instead...`
        )
        marvelFetchIDStartsWith(characterName)
      }
    }

    //function for if Uatu can't find off of the given name, search using nameStartsWith instead.
    async function marvelFetchIDStartsWith(characterName) {
      //set url to base url for character
      let url = `http://gateway.marvel.com/v1/public/characters?nameStartsWith=${characterName}&ts=${ts}`

      //try to get a response
      try {
        const response = await fetch(
          `${url + '&apikey=' + MARVEL_PUBLIC_KEY + '&hash=' + hash}`
        )

        //extrapolate data from the response as json
        const { data } = await response.json()

        //set characterID using the response data
        const characterID = data.results[0].id

        //pass the characterID to the FirstAppearance function
        marvelFetchFirstAppearance(characterID)
      } catch (err) {
        //send a reply stating you can't find that character.
        return message.reply(`I'm sorry, I can't find that character.`)
      }
    }

    //function to get a characters first appearance.
    async function marvelFetchFirstAppearance(characterID) {
      //set url for fetch request
      let firstURL = `https://gateway.marvel.com/v1/public/characters/${characterID}/comics?noVariants=true&orderBy=-onsaleDate&apikey=${MARVEL_PUBLIC_KEY}&ts=${ts}&hash=${hash}`

      //try to get a response
      try {
        let response = await fetch(firstURL)
        //set totalData to equal the response without an offset
        const totalData = await response.json()

        //set total to equal the total amount of data retrieved
        const total = totalData.data.total
        //for finding the earliest dated comic set limit to max of 100
        let limit = 100
        //set offset to total - limit (ie. 456 - 100 = 356)
        let offset = total - limit

        //second fetch url using the offset and limit parameters and ordering by -onsaleDate
        let secondURL = `https://gateway.marvel.com/v1/public/characters/${characterID}/comics?noVariants=true&orderBy=-onsaleDate&apikey=${MARVEL_PUBLIC_KEY}&offset=${offset}&limit=${limit}&ts=${ts}&hash=${hash}`

        response = await fetch(secondURL)
        //extrapolate data from the response as json
        const { data } = await response.json()

        //set a popped counter to 0
        let popped = 0
        //while the last results onsaleDate is the filler date, and the popped counter is less than the limit of 100...
        while (
          data.results[data.results.length - 1].dates[0].date ===
            '-0001-11-30T00:00:00-0500' &&
          popped < limit
        ) {
          //pop the last result
          data.results.pop()
          //increment popped
          popped++
        }

        //set comicDetailURL to the detailURL of the last result in the data filtered from above.
        const comicDetailURL = data.results[data.results.length - 1].urls[0].url
        //set comicImage to the comicImage of the last result in the data filtered from above.
        const comicImage = `${
          data.results[data.results.length - 1].images[0].path
        }.${data.results[data.results.length - 1].images[0].extension}`

        //create a new embed using MessageEmbed()
        const embed = new MessageEmbed()
          //set the color to red (while change in the future)
          .setColor('#FF0000')
          //set the title to the last results title
          .setTitle(data.results[data.results.length - 1].title)
          //set the url to comicDetailURL
          .setURL(comicDetailURL)
          //set the image to the comicImage
          .setImage(comicImage)

        //send the embed to the channel that the command is in
        message.channel.send(embed)
      } catch (err) {
        //if Uatu can't find a valid date after the filtering reply with...
        return message.reply(
          `I'm sorry, I can't find a valid first appearance for that character.`
        )
      }
    }
  },
}
