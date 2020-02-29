import { Composer } from '@telegraf/core'
import { bot } from '../core/bot.js'
import env from '../env.js'

const composer = new Composer()

const deleteFn = async ctx => {
  try {
    await ctx.deleteMessage()
  } catch (e) {
    return ctx.answerCbQuery('This message too old, you should delete it yourserf.', true)
  }
  ctx.answerCbQuery('')
}

composer.action(
  'delete',
  Composer.branch(
    ctx => ['group', 'supergroup'].includes(ctx.chat.type),
    Composer.optional(
      async ctx => {
        const { status } = await ctx.getChatMember(ctx.from.id)
        return ['administrator', 'creator'].includes(status) || ctx.from.id === env.ADMIN_ID
      },
      deleteFn
    ),
    Composer.privateChat(deleteFn)
  )
)

bot.use(composer.middleware())
