import { bot } from '../core/index.js'
import collection from '../core/database/index.js'
import imghash from 'imghash'
import leven from 'leven'
import request from '../lib/request.js'
import fs from 'fs'
import path from 'path'

const saveImage = async url => {
  const filePath = `./.tmp/${path.parse(url).name}`
  const { data: stream } = await request(url, { method: 'GET', responseType: 'stream' })
  const write = fs.createWriteStream(filePath)
  return new Promise((resolve, reject) => {
    stream.pipe(write)
    write.once('error', reject)
    write.once('close', () => resolve(filePath))
  })
}

const deleteImage = async filePath => {
  return fs.promises.unlink(filePath)
}

export const isBoyan = async ({
  chat: { id: chatId },
  message: { message_id: messageId },
  from,
  photo: { file_id: fileId }
}) => {
  const url = await bot.telegram.getFileLink(fileId)
  const filePath = await saveImage(url)
  const hash = await imghash.hash(filePath)
  const boyans = await collection('boyans').find({ chat_id: chatId, picture_hash: { $exists: true } }, 'picture_hash message_id')

  const [boyan] = boyans.filter(({ picture_hash }) => {
    const diff = leven(picture_hash, hash)
    return diff <= 12
  })

  try {
    await deleteImage(filePath)
  } catch (e) {
    console.log(e)
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
