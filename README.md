## Recipe Tracker — Next.js & GraphQL

A full-stack recipe tracking application built with Next.js and a custom GraphQL API, with a strong focus on accessibility, state management, and real-world frontend/backend synchronization.

This project was built as part of Northwestern University’s "COMP_SCI 396: Introduction to Web Development in the AI era" course and represents my first end-to-end experience integrating a React/Next.js frontend with a GraphQL backend.

## Features

- Create, view, update, and delete recipes

- Dynamic routing for individual recipe pages

- GraphQL API for recipe data

- Optimistic UI updates with server reconciliation

- Accessible UI using semantic HTML, ARIA labels, and keyboard navigation

- Responsive layout across screen sizes

- Search functionality with safe regex handling

## Tech Stack

### Frontend:

- Next.js

- React

- TypeScript

- Tailwind CSS

### Backend:

- Node.js

- GraphQL

## Running the Project Locally

### Start the GraphQL Server
From the server directory:

cd server
npm install
npm start

The GraphQL endpoint will be available at:
http://localhost:4000/graphql

You can open this URL in the browser or Apollo Sandbox to run queries and mutations.

### Start the Frontend

From the project root:

npm install
npm run dev

The application will run at:
http://localhost:3000



Author: Tais Martinez

GitHub: https://github.com/taismartinezz

LinkedIn: https://www.linkedin.com/in/taismartinez
