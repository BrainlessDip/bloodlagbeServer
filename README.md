# Blood Lagbe Server

This is the backend server for **Blood Lagbe**, a web application connecting blood donors with people in need of blood. The server is built using **Express.js**, **MongoDB**, and **Clerk** for authentication. It provides API endpoints for user management, posts, and blood donor searches.

---

## Features

- User authentication with Clerk
- Blood donor search by blood group and location
- User profile management
- Post creation, retrieval, and management
- Webhook integration for user creation events

---

## Setup & Installation

1. Clone the repository:  
   `git clone <repository-url>`  
   `cd bloodlagbeServer`

2. Install dependencies:  
   `npm install` or `yarn install`

3. Configure environment variables:  
   Create a `.env` file in the root directory and add:

```

PORT=3000
DB_USER=<your-db-username>
DB_PASS=<your-db-password>
CLERK_API_KEY=<your-clerk-secret-key>
CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>

```

4. Run the server:
   `npm run dev` or `yarn dev`

The server will be accessible at [http://localhost:3000](http://localhost:3000).

---

## Route Summary

| Route              | Method | Description                                       |
| ------------------ | ------ | ------------------------------------------------- |
| `/`                | GET    | Test route, returns "Hello World!"                |
| `/blood-groups`    | GET    | Get users filtered by blood group and/or location |
| `/profile/:userId` | GET    | Get user profile by Clerk ID, including posts     |
| `/me`              | GET    | Get authenticated user's profile                  |
| `/me/posts`        | GET    | Get authenticated user's posts                    |
| `/posts`           | GET    | Get latest posts (limit 8)                        |
| `/posts`           | POST   | Create a new post (authenticated)                 |
| `/me`              | PATCH  | Update authenticated user's profile               |
| `/webhooks/clerk`  | POST   | Clerk webhook for user creation events            |

---

## Notes

- MongoDB is used for storing users and posts.
- Clerk handles authentication, including webhooks for new users.
- Posts include metadata such as creation date and number of likes.
- Ensure your `.env` variables are correctly set for Clerk and MongoDB connection.
