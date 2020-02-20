export default (ctx, next) => {
  // console.log(ctx.state)
  if (!ctx.state.chat.ignore_mode) {
    return next()
  }
}
