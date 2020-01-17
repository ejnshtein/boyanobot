// require('dotenv').config({ path: '../.env' })
import Telegraf from 'telegraf-esm'
import collection from './database/index.js'
import logger from './database/logger.js'
export const bot = new Telegraf(process.env.BOT_TOKEN)

const startDate = Math.floor(Date.now() / 1000)

bot.telegram.getMe()
  .then(botInfo => {
    bot.options.username = botInfo.username
  })

bot.context.db = collection

bot.use(logger)

bot.use((ctx, next) => {
  if (ctx.message && ctx.message.date > startDate - 20000) {
    return next()
  }
})

bot.startPolling()
