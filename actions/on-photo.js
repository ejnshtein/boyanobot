import { Composer } from 'telegraf-esm'
import { bot, getCollection } from '../core/index.js'
import { only } from '../middlewares/index.js'
import { isBoyan, list, user, getRandom } from '../boyan/index.js'
import { templates } from '../lib/index.js'

const composer = new Composer()

composer.on(
  'photo',
  only('supergroup', 'group'),
  async ctx => {
    return tryBoyan(ctx, ctx.message.photo.pop())
  }
)

composer.on(
  'document',
  only('supergroup', 'group'),
  Composer.optional(
    (ctx) => {
      return ctx.message.document.mime_type.includes('image')
    },
    async ctx => {
      return tryBoyan(ctx, ctx.message.document.thumb)
    }
  )
)

async function tryBoyan (ctx, photo) {
  try {
    const boyan = await isBoyan(
      {
        chat: ctx.chat,
        message: ctx.message,
        from: ctx.from,
        photo: photo
      }
    )
    if (boyan) {
      return ctx.reply(
        `${getRandom(user)} <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}${ctx.from.last_name ? ` ${ctx.from.last_name}` : ''}</a> ${getRandom(list)}`,
        {
          reply_to_message_id: ctx.message.message_id,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'source',
                  url: `https://t.me/${ctx.chat.username ? ctx.chat.username : ctx.chat.id}/${boyan.message_id}`
                },
                // {
                //   text: 'show stats',
                //   callback_data: `stats:${ctx.from.id}`
                // }
              ]
            ]
          }
        }
      )
    }
  } catch (e) {
    return ctx.reply(templates.error(e))
  }
}

bot.use(composer.middleware())
