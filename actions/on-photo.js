import { Composer } from '@telegraf/core'
import { bot } from '../core/index.js'
import { only } from '../middlewares/index.js'
import request from '@ejnshtein/smol-request'
import { isUrlWithPhoto } from './on-link.js'
import { tryBoyan } from '../boyan/try-boyan.js'
import ignoreMode from '../middlewares/ignore-mode.js'

const composer = new Composer()

composer.on(
  'photo',
  only('supergroup', 'group'),
  ignoreMode,
  async ctx => {
    // console.log(ctx.message)
    await tryBoyan(ctx, ctx.message.photo.pop())
  }
)

const isUrlPhoto = async (ctx) => {
  try {
    const { headers } = await request(ctx.match[1], { responseType: 'headers' })
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
  only('supergroup', 'group'),
  ignoreMode,
  Composer.optional(
    isUrlPhoto,
    urlBoyan
  )
)
composer.hears(
  /((http|https)\S+)/i,
  only('supergroup', 'group'),
  ignoreMode,
  Composer.optional(
    isUrlWithPhoto,
    urlBoyan
  )
)

composer.on(
  'document',
  only('supergroup', 'group'),
  ignoreMode,
  Composer.optional(
    (ctx) => ctx.message.document.mime_type.includes('image') && ctx.message.document.thumb,
    async ctx => {
      return tryBoyan(ctx, ctx.message.document.thumb)
    }
  )
)
bot.use(composer.middleware())
