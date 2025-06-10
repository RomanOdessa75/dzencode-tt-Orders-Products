# Fullstack Orders and Products Application

## Overview

- **Backend:** Node.js, Express, TypeScript, MySQL (Docker), Prisma ORM, WebSockets, JWT Auth.
- **Frontend:** Next.js, TypeScript, Redux, Bootstrap 5, BEM, WebSockets, i18n, графики (Recharts), web worker.

## Features

- Регистрация и авторизация пользователей (JWT, cookies)
- CRUD для заказов и продуктов (Optimistic Update, web worker)
- График по типам продуктов (Recharts)
- Валидация форм (Zod)
- Защита приватных роутов (SSR + cookies)
- Локализация (i18n)
- Уведомления (Toastify)
- WebSocket для отображения активных подключений
- Docker Compose для всего окружения

## Project Structure

```
/
├── backend/        # Node.js/Express app (API)
│   ├── db_init/    # SQL init script (init.sql)
│   └── ...
├── frontend/       # Next.js app (UI)
│   └── ...
├── docker-compose.yml # Docker config (backend, frontend, mysql)
└── README.md
```

## Quick Start (Docker Compose)

1. Клонируйте репозиторий и перейдите в папку проекта.
2. Запустите все сервисы одной командой:

   ```bash
   docker-compose up --build
   ```

3. Приложение будет доступно по адресу:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3001](http://localhost:3001)
   - MySQL: порт 3307 (user: `user`, password: `password`, db: `orders_products_db`)

## Backend (Express.js)

- Запуск отдельно:
  ```bash
  cd backend
  npm install
  npm run start
  ```
- Переменные окружения:
  - `DATABASE_URL` (см. docker-compose)
- Prisma, миграции: `npx prisma migrate deploy`

## Frontend (Next.js)

- Запуск отдельно:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- Переменные окружения:
  - `NEXT_PUBLIC_API_URL` (см. docker-compose)
- Тесты:
  ```bash
  npm run test
  ```

## Database

- Схема и тестовые данные: `backend/db_init/init.sql`
- Открыть в MySQL Workbench: File → Open SQL Script → выбрать `init.sql`
- Данные для подключения:
  - host: `localhost`, port: `3307`
  - user: `user`, password: `password`
  - database: `orders_products_db`

## Тестовые пользователи

- После запуска init.sql будет создан тестовый пользователь (если добавлен в init.sql)
- Либо зарегистрируйтесь через UI

## Основные страницы

- `/login` — вход
- `/register` — регистрация
- `/orders` — список заказов
- `/products` — список продуктов и график

## Примечания

- Для деплоя на сервер: установите Docker, скопируйте проект, выполните `docker-compose up --build`
- Для работы с БД используйте MySQL Workbench и файл `init.sql`
- Для тестирования используйте команду `npm run test` в папке frontend

---

**Если возникнут вопросы — смотрите комментарии в коде или обращайтесь к автору проекта.**
