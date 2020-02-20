import { Composer } from '@telegraf/core'
import { bot } from '../core/index.js'

const composer = new Composer()

composer.action(
  'mistake',
  Composer.groupChat(
    Composer.branch(
      async ctx => {
        const { status } = await ctx.getChatMember(ctx.from.id)
        return ['administrator', 'creator'].includes(status)
      },
      async ctx => {
        const messageId = ctx.callbackQuery.message.reply_to_message.message_id
        const { ok } = await ctx.db('boyans').deleteOne({
          chat_id: ctx.chat.id,
          message_id: messageId
        })
        if (ok) {
          await ctx.deleteMessage()
          return ctx.answerCbQuery('OK, better luck next time.')
        }
        return ctx.answerCbQuery(`something went wrong...`)
      },
      ctx => ctx.answerCbQuery('You are not an admin to wipe this boyan.', true)
    )
  )
)

bot.use(composer.middleware())
