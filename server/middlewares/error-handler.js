export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)
  let status = error.status || error.statusCode || 500
  let message = error.message
  if (error.type === 'entity.parse.failed') {
    status = 400
    message = 'Некорректный JSON в запросе'
  } else if (error.type === 'entity.too.large') {
    status = 413
    message = 'Слишком большой запрос'
  } else if (error.code === 11000) {
    status = 409
    message = 'Этот логин уже зарегистрирован'
  } else if (error.name === 'ValidationError' || error.name === 'CastError') {
    status = 400
    message = 'Некорректные данные запроса'
  } else if (error.name?.startsWith('Mongo') || error.name === 'MongooseServerSelectionError') {
    status = 503
    message = 'База данных временно недоступна'
  }
  if (!Number.isInteger(status) || status < 400 || status > 599) status = 500
  if (status === 500) {
    console.error('Ошибка сервера:', error.name || 'Error')
    message = 'Внутренняя ошибка сервера'
  }
  if (req.path === '/api' || req.path.startsWith('/api/')) {
    return res.status(status).json({ error: message, data: null })
  }
  res.status(status).type('text').send(message)
}
