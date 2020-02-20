import { isBoyan } from './index.js'
import { templates } from '../lib/index.js'
import { bot } from '../core/bot.js'
export async function tryBoyan (ctx, file) {
  try {
    const url = typeof file === 'string' ? file : await bot.telegram.getFileLink(file)
    isBoyan(
      {
        chat: ctx.chat,
        message: ctx.message,
        from: ctx.from,
        url
      }
    )
  } catch (e) {
    console.log(e)
    if (/wrong file id/i.test(e.message)) { return } // Telegram broke some file id, so...
    return ctx.reply(templates.error(e))
  }
}
