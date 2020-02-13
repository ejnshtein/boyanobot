import collection from '../core/database/index.js'
import imghash from 'imghash'
import leven from 'leven'
import request from '@ejnshtein/smol-request'
import { performance } from 'perf_hooks'
import argv from '../lib/argv.js'

export const isBoyan = async ({
  chat: { id: chatId },
  message: { message_id: messageId },
  from,
  url
}) => {
  const { data: buffer } = await request(url, { responseType: 'buffer' })
  const hash = await imghash.hash(buffer, 32)
  const boyans = await collection('boyans').find({ chat_id: chatId, picture_hash: { $exists: true } }, 'picture_hash message_id')

  const startTime = performance.now()
  let boyan = null
  for (let i = 0; i < boyans.length; i++) {
    const b = boyans[i]
    const { picture_hash } = b
    const diff = leven(picture_hash, hash)
    // if (diff < 20) {
    //   console.log(diff)
    // }
    if (diff <= 10 && !boyan) {
      boyan = b
      break
    }
  }

  // const boyan = boyans.find(({ picture_hash }) => {

  //   const diff = leven(picture_hash, hash)
  //   // if (diff < 20) {
  //   //   console.log(diff)
  //   // }
  //   return diff <= 10
  // })

  const endTime = performance.now()
  if (argv('--debug')) {
    console.log(`Processed ${boyans.length} boyans in ${endTime - startTime} ms.`)
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
