import collection from '../core/database/index.js'
import imghash from 'imghash'
import leven from 'leven'
import request from '@ejnshtein/smol-request'
import { performance } from 'perf_hooks'
import argv from '../lib/argv.js'

const findBoyan = (boyans, hash) => {
  for (let i = 0; i < boyans.length; i++) {
    const b = boyans[i]
    const diff = leven(b.picture_hash, hash)
    if (diff <= 12) {
      return b
    }
  }
  return undefined
}

const isBoyanInDb = async (chat_id, hash, skip = 0) => {
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

export const isBoyan = async ({
  chat: { id: chatId },
  message: { message_id: messageId },
  from,
  url
}) => {
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
    return boyan
  } else {
    await collection('boyans').create({
      chat_id: chatId,
      message_id: messageId,
      from,
      picture_hash: hash
    })
    return false
  }
}
