import collection from '../core/database/index.js'
import imghash from 'imghash'
import leven from 'leven'
import request from '@ejnshtein/smol-request'
import { performance } from 'perf_hooks'
import argv from '../lib/argv.js'
import effector from 'effector'
import { bot } from '../core/bot.js'
import { getRandom } from './get-phrase.js'
import { list, user } from './index.js'
import { templates } from '../lib/index.js'

const { createEffect, createStore, createEvent, guard } = effector

const removeBoyan = createEvent('remove pic from queue')

export const isBoyan = createEvent('is boyan')

const store = createStore([])
  .on(isBoyan, (state, boyan) => ([...state, boyan]))
  .on(removeBoyan, (state, { chat_id, message_id }) => state.filter(({ chat, message }) => !(chat.id !== chat_id && message.message_id !== message_id)))

const isBoyanFx = createEffect('is boyan', {
  handler: async () => {
    const { chat: { id: chatId, username }, message: { message_id: messageId }, from, url } = store.getState().shift()
    try {
      const { data: buffer } = await request(url, { responseType: 'buffer' })
      const hash = await imghash.hash(buffer, 32)

      const startTime = performance.now()
      const { boyansLength, boyan } = await isBoyanInDb(chatId, hash)
      const endTime = performance.now()

      if (argv('--debug')) {
        console.log(`Processed ${boyansLength} boyans in ${endTime - startTime} ms.`)
      }

      if (boyan) {
        // console.log(boyan, chatId, messageId, from)
        await collection('boyans').create({
          chat_id: chatId,
          message_id: messageId,
          from,
          original: boyan._id
        })
        await bot.telegram.sendMessage(
          chatId,
          `${getRandom(user)} <a href="tg://user?id=${from.id}">${from.first_name}${from.last_name ? ` ${from.last_name}` : ''}</a> ${getRandom(list)}`,
          {
            reply_to_message_id: messageId,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'source',
                    url: `https://t.me/${username || `c/${`${chatId}`.slice(4)}`}/${boyan.message_id}`
                  },
                  {
                    text: 'mistake',
                    callback_data: 'mistake'
                  }
                ]
              ]
            }
          }
        )
      } else {
        await collection('boyans').create({
          chat_id: chatId,
          message_id: messageId,
          from,
          picture_hash: hash
        })
      }
    } catch (e) {
      await bot.telegram.sendMessage(
        chatId,
        templates.error(e),
        {
          reply_to_message_id: messageId
        }
      )
    }
    removeBoyan({ chat_id: chatId, message_id: messageId })
    const newState = store.getState()
    if (newState.length > 0) {
      return isBoyanFx()
    }
  }
})

// isBoyanFx.done.watch(() => {
//   global.gc()
// })

const isWorking = isBoyanFx.pending.map(pending => !pending)

guard({
  source: isBoyan,
  filter: isWorking,
  target: isBoyanFx
})

// guard({
//   source: isBoyanFx.doneData,
//   filter: ,
//   target: isBoyanFx
// })

function findBoyan (boyans, hash) {
  for (let i = 0; i < boyans.length; i++) {
    const b = boyans[i]
    const diff = leven(b.picture_hash, hash)
    if (diff <= 12) {
      return b
    }
  }
  return undefined
}

async function isBoyanInDb (chat_id, hash, skip = 0) {
  const boyans = await collection('boyans')
    .find(
      {
        chat_id,
        picture_hash: {
          $exists: true
        }
      },
      'picture_hash message_id'
    )
    .sort({ _id: -1 })
    .limit(500)
    .skip(skip)

  const boyansLength = boyans.length

  const boyan = findBoyan(boyans, hash)
  if (boyans.length === 500 && !boyan) {
    return isBoyanInDb(chat_id, hash, skip + 500)
  }
  return {
    boyansLength: skip + boyansLength,
    boyan
  }
}
