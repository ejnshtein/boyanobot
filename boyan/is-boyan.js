import { getCollection, bot } from '../core/index.js'
import hasha from 'hasha'
// import leven from 'leven'
import request from '../lib/request.js'

export const isBoyan = async ({
  chat: { id: chatId },
  message: { message_id: messageId },
  from,
  photo: { file_id: fileId }
}) => {
  const url = await bot.telegram.getFileLink(fileId)
  const buffer = await request(url, { method: 'GET', responseType: 'buffer' })
  const hash = await hasha.async(buffer.data, { encoding: 'hex', algorithm: 'md5' })
  const boyan = await getCollection('boyans').findOne({
    chat_id: chatId,
    picture_hash: hash
  }).exec()
  if (boyan) {
    await getCollection('boyans').create({
      chat_id: chatId,
      message_id: messageId,
      from,
      original: boyan._id
    })
    return boyan
  } else {
    await getCollection('boyans').create({
      chat_id: chatId,
      message_id: messageId,
      from,
      picture_hash: hash
    })
    return false
  }
}
