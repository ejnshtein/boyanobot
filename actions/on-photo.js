import { Composer } from 'telegraf-esm'
import { bot } from '../core/index.js'
import { only } from '../middlewares/index.js'
import { isBoyan, list, user, getRandom } from '../boyan/index.js'
import { templates, request } from '../lib/index.js'
import { isUrlWithPhoto } from './on-link.js'

const composer = new Composer()

composer.on(
  'photo',
  only('supergroup', 'group'),
  async ctx => {
    return tryBoyan(ctx, ctx.message.photo.pop())
  }
)

const isUrlPhoto = async (ctx) => {
  try {
    const { headers } = await request(ctx.match[1], { responseType: 'only meta' })
    if (headers['content-type'] && headers['content-type'].includes('image')) {
      ctx.state.url = ctx.match[1]
      return true
    } else {
      return false
    }
  } catch (e) {
    return false
  }
}

const urlBoyan = async ctx => {
  return tryBoyan(ctx, ctx.state.url)
}

composer.hears(
  /((http|https)\S+\.(jpg|png))/i,
  Composer.optional(
    isUrlPhoto,
    urlBoyan
  )
)
composer.hears(
  /((http|https)\S+)/i,
  Composer.optional(
    isUrlWithPhoto,
    urlBoyan
  )
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

export async function tryBoyan (ctx, file) {
  try {
    const url = typeof file === 'string' ? file : await bot.telegram.getFileLink(file)
    const boyan = await isBoyan(
      {
        chat: ctx.chat,
        message: ctx.message,
        from: ctx.from,
        url
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
                }
              ]
            ]
          }
        }
      )
    }
  } catch (e) {
    console.log(e)
    if (/wrong file id/i.test(e.message)) { return } // Telegram broke some file id, so...
    return ctx.reply(templates.error(e))
  }
}

bot.use(composer.middleware())
