import collection from '../core/database/index.js'
import imghash from 'imghash'
import leven from 'leven'
import request from '@ejnshtein/smol-request'

export const isBoyan = async ({
  chat: { id: chatId },
  message: { message_id: messageId },
  from,
  url
}) => {
  const { data: buffer } = await request(url, { responseType: 'buffer' })
  const hash = await imghash.hash(buffer, 32)
  const boyans = await collection('boyans').find({ chat_id: chatId, picture_hash: { $exists: true } }, 'picture_hash message_id')

  const boyan = boyans.find(({ picture_hash }) => {
    const diff = leven(picture_hash, hash)
    // console.log(diff)
    return diff <= 8
  })

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
