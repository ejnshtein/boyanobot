import { Composer } from '@telegraf/core'
import { bot } from '../core/index.js'
import env from '../env.js'

const composer = new Composer()

composer.command(
  'ignoreuser',
  Composer.groupChat(
    Composer.branch(
      async ctx => {
        const { status } = await ctx.getChatMember(ctx.from.id)
        return ['administrator', 'creator'].includes(status) || ctx.from.id === env.ADMIN_ID
      },
      async ctx => {
        if (
          !(ctx.message.reply_to_message && ctx.message.reply_to_message.message_id)
        ) {
          return ctx.reply('You must reply to user message.')
        }
        const fromId = ctx.message.reply_to_message.from.id
        const { ok } = await ctx.db('chats').updateOne(
          { id: ctx.chat.id },
          { $addToSet: { ignored_users: fromId } }
        )
        if (ok) {
          return ctx.reply('Done.', {
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
