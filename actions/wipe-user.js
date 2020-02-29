import { Composer } from '@telegraf/core'
import { bot } from '../core/index.js'
import env from '../env.js'

const composer = new Composer()

composer.command(
  'wipe',
  Composer.groupChat(
    Composer.branch(
      async ctx => {
        const { status } = await ctx.getChatMember(ctx.from.id)
        return ['administrator', 'creator'].includes(status) || ctx.from.id === env.ADMIN_ID
      },
      async ctx => {
        const query = {}
        if (!ctx.message.text.replace(/(\/)?wipe(@\S+)?(\s)?/i, '')) {
          if (
            !(ctx.message.reply_to_message && ctx.message.reply_to_message.message_id)
          ) {
            return ctx.reply('You must reply to user message.')
          } else {
            const fromId = ctx.message.reply_to_message.from.id
            query['from.id'] = fromId
          }
        } else {
          const text = ctx.message.text.replace(/(\/)?wipe(@\S+)?(\s)?/i, '')
          if (/[0-9]+/.test(text)) {
            query['from.id'] = Number.parseInt(text)
          } else {
            query['from.username'] = text
          }
        }
        if (Object.keys(query).length === 0) {
          return ctx.reply('Not valid query')
        }
        query.chat_id = ctx.chat.id
        const { ok, n } = await ctx.db('boyans').deleteMany(query)
        if (ok) {
          return ctx.reply(`Done. (${n} boyans wiped.)`, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'ok',
                    callback_data: 'delete'
                  }
                ]
              ]
            }
          })
        }
        return ctx.reply('Something went wrong...')
      },
      ctx => ctx.reply('You are not an admin.')
    )
  )
)

bot.use(composer.middleware())
