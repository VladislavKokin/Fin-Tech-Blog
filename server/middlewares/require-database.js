import { isDatabaseReady } from '../config/database.js'
import { HttpError } from '../helpers/http-error.js'

export function requireDatabase(req, res, next) {
  if (!isDatabaseReady()) return next(new HttpError(503, 'База данных не подключена. Задайте MONGODB_URI в файле .env и перезапустите сервер.'))
  next()
}
