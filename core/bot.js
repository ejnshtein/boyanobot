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

// Thanks https://github.com/backmeupplz/voicy/blob/master/middlewares/checkDate.js
bot.use((ctx, next) => {
  if (ctx.update.callback_query) {
    next()
    return
  }
  const message =
    ctx.update.message || ctx.update.channel_post || ctx.update.callback_query
  if (!message) {
    if (!ctx.update.edited_message && !ctx.update.edited_channel_post) {
      // console.info(
      //   'Not processing because no message found',
      //   JSON.stringify(ctx.update, undefined, 2)
      // )
    }
    return
  }
  const isMsgNew = Date.now() / 1000 - message.date < 5 * 60
  if (!isMsgNew) {
    // console.info(
    //   'Not processing message',
    //   message.date,
    //   JSON.stringify(message, undefined, 2)
    // )
  }
  if (isMsgNew) {
    next()
  }
})

bot.startPolling()
