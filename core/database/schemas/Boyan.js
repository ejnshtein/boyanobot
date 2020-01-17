import mongoose from 'mongoose'

const { Schema } = mongoose

export const Boyan = new Schema({
  chat_id: {
    type: Number,
    required: true
  },
  message_id: {
    type: Number,
    required: true
  },
  from: {
    id: Number,
    is_bot: {
      type: Boolean,
      required: true
    },
    first_name: {
      type: String,
      required: true
    },
    last_name: {
      type: String,
      required: false
    },
    username: {
      type: String,
      required: false
    }
  },
  picture_hash: {
    type: String,
    required: false
  },
  original: {
    type: Schema.Types.ObjectId,
    required: false
  }
}, {
  timestamps: {
    updatedAt: 'updated_at',
    createdAt: 'created_at'
  }
})
