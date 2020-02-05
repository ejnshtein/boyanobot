import request from '@ejnshtein/smol-request'
import cheerio from 'cheerio'

const trustedDomains = [
  {
    domain: 'danbooru.donmai.us',
    path: /\/posts\/[0-9]+/i
  },
  {
    domain: 'gelbooru.com',
    path: /\/index\.php/i,
    query: /id=[0-9]+/i
  }
  // ''
]

const isTrustedUrl = url => {
  const { hostname, pathname, search } = new URL(url)
  return trustedDomains.some(({ domain, path, query }) => {
    const s = query
      ? search
        ? query.test(search)
        : false
      : true
    return domain === hostname && path.test(pathname) && s
  })
}

export const isUrlWithPhoto = async (ctx) => {
  if (!isTrustedUrl(ctx.match[1])) {
    return false
  }
  try {
    const { data } = await request(ctx.match[1])
    const url = hasPhoto(data)
    if (url) {
      ctx.state.url = url
      return true
    } else {
      return false
    }
  } catch (e) {
    console.log(e)
    return false
  }
}

const hasPhoto = html => {
  const selector = cheerio.load(html)
  const photoUrl = selector('meta[name="og:image"]').first().attr('content') || selector('meta[property="og:image"]').first().attr('content')
  if (photoUrl) {
    return photoUrl
  } else {
    return false
  }
}
