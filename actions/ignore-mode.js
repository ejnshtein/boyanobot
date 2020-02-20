import { Composer } from '@telegraf/core'
import { bot } from '../core/index.js'

const composer = new Composer()

composer
  .command(
    'ignoreon',
    Composer.groupChat(
      Composer.admin(
        async ctx => {
          await ctx.db('chats').updateOne({
            id: ctx.chat.id
          }, {
            $set: {
              ignore_mode: true
            }
          }).then(console.log)
          return ctx.reply('Done. Ignore mode on.')
        }
      )
    )
  )
  .command(
    'ignoreoff',
    Composer.groupChat(
      Composer.admin(
        async ctx => {
          await ctx.db('chats').updateOne({
            id: ctx.chat.id
          }, {
            $set: {
              ignore_mode: false
            }
          })
          return ctx.reply('Done. Ignore mode off.')
        }
      )
    )
  )

bot.use(composer.middleware())
