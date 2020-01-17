import { Composer } from 'telegraf-esm'
import { bot, getCollection } from '../core/index.js'
import { templates } from '../lib/index.js'

const composer = new Composer()

composer.command(
  'mystats',
  Composer.branch(
    (ctx) => ctx.chat.type === 'private',
    async ctx => {
      try {
        const boyansCount = await getCollection('boyans')
          .find({
            'from.id': ctx.from.id,
            original: { $exists: true }
          })
          .countDocuments()
        const chatBoyansCount = await getCollection('boyans')
          .aggregate()
          .match({ 'from.id': ctx.from.id })
          .group({ _id: '$chat_id' })
          .exec()

        await ctx.reply(
          `У вас было ${boyansCount} баянов в ${chatBoyansCount.length} чат${chatBoyansCount.length > 1 ? 'ах' : 'e'}!`
        )
      } catch (e) {
        return ctx.reply(templates.error(e), true)
      }
    },
    async ctx => {
      try {
        const yourBoyanCount = await getCollection('boyans')
          .find({
            chat_id: ctx.chat.id,
            'from.id': ctx.from.id,
            original: { $exists: true }
          })
          .countDocuments()

        await ctx.reply(`У вас было ${yourBoyanCount} баянов в этом чате!`)
      } catch (e) {
        return ctx.reply(templates.error(e), true)
      }
    }
  )
)

bot.use(composer.middleware())
