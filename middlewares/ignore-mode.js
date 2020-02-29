export default (ctx, next) => {
  if (!ctx.state.chat.ignore_mode) {
    if (!ctx.state.chat.ignored_users.includes(ctx.from.id)) {
      return next()
    }
  }
}
