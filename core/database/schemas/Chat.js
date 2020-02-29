import mongoose from 'mongoose'

const { Schema } = mongoose

export const Chat = new Schema({
  id: {
    type: Number,
    unique: true
  },
  username: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: true
  },
  ignore_mode: {
    type: Boolean,
    required: true,
    default: false
  },
  ignored_users: {
    type: [Number],
    required: true,
    default: []
  }
}, {
  timestamps: {
    updatedAt: 'updated_at',
    createdAt: 'created_at'
  }
})
