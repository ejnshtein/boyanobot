import { Composer } from 'telegraf-esm'
import { bot, getCollection } from '../core/index.js'
import { only } from '../middlewares/index.js'
import { templates } from '../lib/index.js'

const composer = new Composer()

composer.command(
  'chatstats',
  only('supergroup', 'group'),
  async ctx => {
    try {
      const boyans = await getCollection('boyans')
        .aggregate(
          [
            {
              $match: {
                original: { $exists: true },
                chat_id: ctx.chat.id
              }
            },
            {
              $group: {
                _id: '$from.id',
                boyans: { $push: '$_id' },
                from: { $first: '$from' }
              }
            },
            {
              $lookup: {
                from: 'boyans',
                localField: 'boyans',
                foreignField: '_id',
                as: 'chat_boyans'
              }
            },
            {
              $addFields: {
                boyan_count: {
                  $size: '$chat_boyans'
                }
              }
            },
            {
              $project: {
                boyans: 0,
                chat_boyans: 0
              }
            },
            {
              $sort: {
                boyan_count: -1
              }
            },
            {
              $limit: 10
            }
          ]
        )
        .exec()

      await ctx.reply(
        `ТОП 10 баянистов чата ${ctx.chat.title}!\n${boyans.map((user, id) => `${id + 1} <a href="tg://user?id=${user.id}">${user.from.first_name}${user.from.last_name ? ` ${user.from.last_name}` : ''}</a> с ${user.boyan_count} баян${user.boyan_count > 1 ? 'анами' : 'ом'}`).join('\n')}`,
        {
          parse_mode: 'HTML'
        }
      )
    } catch (e) {
      return ctx.reply(templates.error(e), true)
    }
  }
)

bot.use(composer.middleware())
