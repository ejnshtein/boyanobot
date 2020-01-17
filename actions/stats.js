import { Composer } from 'telegraf-esm'
import { bot, getCollection } from '../core/index.js'
import { only } from '../middlewares/index.js'
import { templates } from '../lib/index.js'

const composer = new Composer()

composer.action(
  /stats:([0-9]+)/i,
  only('supergroup', 'group'),
  async ctx => {
    try {
      const boyansCount = await getCollection('boyans')
        .find({
          chat_id: ctx.chat.id,
          'from.id': Number.parseInt(ctx.match[1]),
          original: { $exists: true }
        })
        .countDocuments()

      await ctx.answerCbQuery(
        `${boyansCount} баяна от этого баяниста в чате!`,
        true
      )
    } catch (e) {
      return ctx.answerCbQuery(templates.error(e), true)
    }
  }
)

bot.use(composer.middleware())
