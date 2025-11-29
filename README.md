# Daily Diet API

A RESTful API built with **Node.js**, **Fastify**, and **Knex** to help users manage their daily diet. This application allows users to track meals, monitor whether they are within their diet plan, and view usage metrics.

## 🚀 Technologies

This project was developed with the following technologies:

- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Fastify](https://www.fastify.io/)
- [Knex.js](https://knexjs.org/) (Query Builder)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [Vitest](https://vitest.dev/) (Testing)
- [Zod](https://zod.dev/) (Schema Validation)

## ✨ Features

- **User Management**: Create, view, update, and delete users.
- **Meal Tracking**: Record meals with name, description, date/time, and diet status (on/off diet).
- **Metrics Dashboard**: Retrieve statistics including:
  - Total meals recorded.
  - Total meals strictly within the diet.
  - Total meals outside the diet.
  - Best sequence (streak) of meals within the diet.
- **Session Handling**: Identifies users via cookies/session IDs.

## 🛠️ Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js** (v20+ recommended)
- **npm** (or yarn/pnpm)
- **Docker** and **Docker Compose** (Required for the database)

## 📦 Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/daily-diet-api.git
    cd daily-diet-api
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory based on the example:

    ```bash
    cp default.env .env
    ```

    _Make sure to fill in the necessary database variables in your `.env` file._

## ⚡ Running the Project

This project uses a convenient script to start the Docker container for the database, run migrations, and start the server in watch mode simultaneously.

**Start the Development Server:**

```bash
npm run dev
```

> **Note:** This command executes `docker compose up`, waits for the database, runs `knex:migrate`, and then starts the Node server.

## 🧪 Running Tests

The application uses **Vitest** for E2E and unit testing.

- **Run all tests:**

  ```bash
  npm test
  ```

- **Run tests in watch mode (with a dedicated test database):**

  ```bash
  npm run test:watch
  ```

## 📖 API Documentation

You can import the Postman collection provided in this repository to test the routes:
📂 `docs/Daily-Diet-API.postman_collection.json`

### Users

| Method   | Endpoint     | Description                |
| :------- | :----------- | :------------------------- |
| `POST`   | `/users`     | Create a new user account. |
| `GET`    | `/users/:id` | Get user profile by ID.    |
| `PUT`    | `/users/:id` | Update user details.       |
| `DELETE` | `/users/:id` | Delete a user account.     |

### Meals

| Method   | Endpoint         | Description                            |
| :------- | :--------------- | :------------------------------------- |
| `POST`   | `/meals`         | Record a new meal.                     |
| `GET`    | `/meals`         | List all meals for the logged-in user. |
| `GET`    | `/meals/metrics` | Get user diet metrics.                 |
| `PUT`    | `/meals/:id`     | Update a specific meal.                |
| `DELETE` | `/meals/:id`     | Delete a specific meal.                |

### System

| Method | Endpoint  | Description                          |
| :----- | :-------- | :----------------------------------- |
| `GET`  | `/status` | Health check (DB connection status). |

## 🤝 Contributing

This project enforces **Conventional Commits**. Please ensure your commit messages follow the standard.

- **Commit helper:**
  ```bash
  npm run commit
  ```
- **Linting:**
  ```bash
  npm run lint:check
  # or to fix issues automatically
  npm run lint:fix
  ```

## 📝 License

This project is licensed under the **ISC License**.
