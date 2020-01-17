export default (...only) => ({ chat }, next) => {
  if (only.includes(chat.type)) {
    if (typeof next === 'function') {
      next()
    } else {
      return true
    }
  }
}
