# Assignment 6

### 1. Install Dependencies

```bash
cd pr-6
npm install
```

### 2. Database Setup

#### Create Database:

**Using pgAdmin**

1. Open pgAdmin
2. Connect to PostgreSQL server
3. Right-click on "Databases" --> Create --> Database
4. In "Database" field enter: `students_db`
5. Click "Save"


### 3. Run Migrations

```bash
npm run migration:run
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
PG_USER=postgres
PG_PASSWORD=your_password_here
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE_NAME=students_db
```

 **Important:** 
- Replace `your_password_here` with your PostgreSQL password
- Replace `PG_USER` with your PostgreSQL username if different

### 5. Start Server

```bash
npm start
```


## Запуск

```bash
# Development режим
npm run dev

# Production режим 
NODE_ENV=production npm start
```

## Тестирование

```bash
npm test
npm run test:coverage
```

## Доступные URL

| URL | Описание |
|-----|----------|
| http://localhost:3000/api-docs | Swagger UI документация |
| http://localhost:3000/status | Мониторинг сервера |
| http://localhost:3000/api/auth | Аутентификация |
| http://localhost:3000/api/students | CRUD студентов |

## Логирование 

- **Development**: вывод в консоль
- **Production**: 
  - `logs/combined.log` - все логи
  - `logs/error.log` - только ошибки

