import collection from './index.js'
const users = collection('users')
const chats = collection('chats')

export default async ({ updateType, chat, from, state }, next) => {
  if (
    updateType === 'callback_query' ||
    (updateType === 'message' && chat.type === 'private')
  ) {
    const { id, ...userData } = from
    state.user = await users.findOneAndUpdate(
      { id },
      { $set: userData },
      { new: true, upsert: true }
    )
  }
  if (['supergroup', 'group'].includes(chat.type)) {
    const { id, ...chatData } = chat
    state.chat = await chats.findOneAndUpdate(
      { id },
      { $set: chatData },
      { new: true, upsert: true }
    ).exec()
  }
  next()
}
