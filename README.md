# FinTech Blog — SSR

Проект переведён на архитектуру Ledger: Express + Vite middleware в разработке,
React SSR и гидратация, отдельные серверные модели, сервисы, контроллеры и API.
Разметка страниц, CSS Modules, изображения и анимации переходов сохранены.
Первый HTML сразу видим без JavaScript; анимации работают при переходах.

## Запуск

Нужен Node.js 22.13+ (рекомендуется 24).

```bash
npm install
cp .env.example .env
npm run dev
```

Если `.env` уже существует, сохраните его и заполните недостающие переменные.
Открыть http://127.0.0.1:5173. Один Express-сервер обслуживает HTML и `/api`.
Vite обновляет клиент, `node --watch` перезапускает сервер. После изменения `.env`
перезапустите команду вручную.

## Куда вставить MongoDB / Mongoose

**В `.env` в корне Blog, в строку `MONGODB_URI`:**

```dotenv
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/blog?retryWrites=true&w=majority
```

Либо локальная база:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/blog
```

Используйте один вариант с вашими данными. В Atlas разрешите адрес сервера и
создайте пользователя базы. Спецсимволы в имени/пароле URI должны быть URL-кодированы.

Подключение: `server/config/database.js`, вызов `mongoose.connect(uri)`.
`server.js` берёт URI из окружения. В исходники ссылку вставлять не нужно.
`.env` исключён из Git. Префикс `VITE_` для секретов не используйте.

Без URI сервер запускается и рендерит главную страницу. Страницы/API с данными
возвращают понятную ошибку `503`; фиктивного сохранения нет. При заданной, но
недоступной базе запуск завершается ошибкой примерно через 5 секунд.
Состояние сервера: `GET /api/health`.

## Администратор и исходные статьи

После подключения MongoDB создайте первого администратора:

```bash
npm run create-admin
```

Команда спросит логин и пароль; пароль вводится в видимом режиме и не попадает
в историю shell. Логин: 3–15 букв/цифр/`_`; пароль: 8–20 символов, с заглавной
буквой, цифрой и одним из `-#$%!@&*?`. При существующем логине команда вернёт ошибку.
Новые пользователи через сайт всегда получают роль читателя.

Исходные статьи сохранены в `data/posts.json`, приложение этот архив не обслуживает.
Старые JSON-пользователи с открытыми паролями и сессии удалены из клиентских исходников.
JSON Server больше не требуется. Чтобы перенести существующие статьи:

```bash
npm run import-posts -- ЛОГИН_АДМИНИСТРАТОРА
```

Импорт запускается только этой командой, повторный запуск пропускает ранее
импортированные записи. Пользователи с открытыми паролями, старые сессии и
комментарии из JSON не импортируются. Без этой команды новая база пуста;
статьи можно создавать через прежний интерфейс администратора.

## Production

Создайте секрет и вставьте его в `JWT_SECRET` в `.env`:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
npm run build
npm start
```

Production требует секрет от 32 символов. В dev при пустом секрете создаётся
временный; после перезапуска старые сессии истекают. `npm run preview` также
запускает Express в production, а не статический Vite preview.

Сборка: `dist/client` — браузерный JS/CSS/изображения, `dist/server` — React SSR.
На сервере также нужны `server.js`, папки `server` и `shared`, `package.json`,
`package-lock.json`, установленные зависимости и `.env`. Vite dev server
в production не используется.

Cookie в production имеет `Secure`: авторизация в браузере требует HTTPS.
За HTTPS reverse proxy задайте внешний origin:

```dotenv
PUBLIC_ORIGIN=https://blog.example.com
```

Запросы, меняющие данные, проверяются по этому адресу. Без переменной
используется протокол и `Host` запроса; произвольные `X-Forwarded-*` не считаются
доверенными. `PORT=5173`, `HOST=127.0.0.1` по умолчанию; для контейнера задайте
`HOST=0.0.0.0`.

Необязательная `WEATHER_API_KEY` — ваш ключ OpenWeather для прежнего блока
погоды. Ключ теперь используется сервером через `/api/weather`, в браузерный
bundle не попадает. Без ключа блок сообщает о недоступности погоды.

## Устройство

- `server.js` — окружение, MongoDB, запуск и остановка.
- `server/app.js` — Express, API, dev/production middleware.
- `server/load-page.js` — предзагрузка статей, статьи и пользователей по URL.
- `server/routes/pages.js` — сборка HTML, безопасного состояния и CSS для SSR.
- `server/models`, `services`, `controllers`, `routes`, `middlewares`, `helpers`
  — серверная работа с данными, сессиями и правами.
- `src/App.jsx` — прежние маршруты и компоненты.
- `src/entry-server.jsx` — `StaticRouter`, `renderToString`, Redux store на запрос.
- `src/entry-client.jsx` — `BrowserRouter`, `hydrateRoot`, тот же Redux state.
- `shared/api` — тонкие браузерные запросы к `/api`.
- `shared/constants` — общие роли, сообщения об ошибках и размер страницы; используются клиентом и сервером.

Данные маршрутов `/posts`, `/post/:id`, `/post/:id/edit`, `/users` загружаются
на сервере. Поиск и пагинация сохраняются в URL. Вход восстанавливается через
`HttpOnly`, `SameSite=Lax` JWT-cookie; токен не хранится в Redux/sessionStorage
и не вставляется в HTML. Пароли хранятся в bcrypt-хэшах. У каждого SSR-запроса
свой store; дата футера передаётся с сервера в часовом поясе Europe/Moscow.

## API

Ответы: `{error:null,data:...}`; ошибки: `{error:"Сообщение",data:null}`
с HTTP-статусом 400/401/403/404/409/503.

| Метод | URL | Доступ |
| --- | --- | --- |
| POST | `/api/auth/register`, `/api/auth/login` | Все; тело `{login,password}` |
| POST | `/api/auth/logout` | Все |
| GET | `/api/auth/me` | Текущий пользователь или `null` |
| GET | `/api/posts?search=&page=1&limit=9` | Все |
| GET | `/api/posts/:id` | Все |
| POST, PUT, DELETE | `/api/posts`, `/api/posts/:id` | Администратор |
| POST | `/api/posts/:id/comments` | Читатель, модератор, администратор |
| DELETE | `/api/posts/:id/comments/:commentId` | Модератор, администратор |
| GET | `/api/users`, `/api/roles` | Администратор |
| PATCH | `/api/users/:id/role` | Администратор; тело `{roleId}` |
| DELETE | `/api/users/:id` | Администратор |

Роли: администратор `0`, модератор `1`, читатель `2`, гость `3`.
Права проверяются сервером независимо от клиентского UI.

## Проверки

```bash
npm run lint
npm test
npm run build
```

Тесты работают без сети и MongoDB: проверяют SSR реальных компонентов,
предзагрузку, изоляцию store, безопасный JSON, API ACL, CRUD, bcrypt и JWT.
MongoDB-подключение проверьте отдельно после добавления вашей URI.
