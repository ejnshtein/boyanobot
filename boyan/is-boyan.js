import { bot } from '../core/index.js'
import collection from '../core/database/index.js'
import imghash from 'imghash'
import leven from 'leven'
import request from '../lib/request.js'

const streamToBuffer = async url => {
  const { data: stream } = await request(url, { method: 'GET', responseType: 'stream' })
  return new Promise((resolve, reject) => {
    const buffers = []
    stream.on('data', (data) => buffers.push(Buffer.from(data)))
    stream.once('error', reject)
    stream.once('end', () => resolve(Buffer.concat(buffers)))
  })
}

export const isBoyan = async ({
  chat: { id: chatId },
  message: { message_id: messageId },
  from,
  photo: { file_id: fileId }
}) => {
  const url = await bot.telegram.getFileLink(fileId)
  const buffer = await streamToBuffer(url)
  const hash = await imghash.hash(buffer, 16)
  const boyans = await collection('boyans').find({ chat_id: chatId, picture_hash: { $exists: true } }, 'picture_hash message_id')

  const boyan = boyans.find(({ picture_hash }) => {
    const diff = leven(picture_hash, hash)
    // console.log(diff)
    return diff <= 12
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
