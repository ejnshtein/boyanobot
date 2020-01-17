import { getCollection, bot } from '../core/index.js'
import hasha from 'hasha'
import request from '../lib/request.js'

// imageHash
//   .hash('buffer/or/path/to/file/', 8, 'hex')
//   .then((hash) => {
//     console.log(hash.hash); // '83c3d381c38985a5'
//     console.log(hash.type); // 'blockhash8'
//   })

export const isBoyan = async ({
  chat: { id: chatId },
  message: { message_id: messageId },
  from,
  photo: { file_id: fileId }
}) => {
  const url = await bot.telegram.getFileLink(fileId)
  const buffer = await request(url, { method: 'GET', responseType: 'buffer' })
  const hash = await hasha.async(buffer.data, { encoding: 'hex', algorithm: 'sha512' })
  const boyan = await getCollection('boyans').findOne({
    chat_id: chatId,
    picture_hash: hash
  })
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
