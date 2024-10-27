# Backend for Capstone App 🚀

This repository contains the backend code for the Capstone App. It is built using Node.js, Express, and MySQL, and it provides various APIs for authentication, profile management, trip management, and map functionalities.

## Table of Contents

- [Backend for Capstone App 🚀](#backend-for-capstone-app-)
  - [Table of Contents](#table-of-contents)
  - [Tech Stack](#tech-stack)
  - [APIs](#apis)
    - [Authentication](#authentication)
    - [Profile](#profile)
    - [Trips](#trips)
    - [Maps](#maps)
  - [Environment Variables](#environment-variables)

## Tech Stack 🛠️

- **Node.js**
- **Express**
- **MySQL**
- **Vercel**
- **OpenAI API**
- **GoogleMaps API**

## APIs

**BASE URL**: `https://trailmates-backend.vercel.app/`

### Test Route

- **GET /api/test**: Test api is working.

### Authentication

- **POST /api/auth/login**: Login a user.
- **POST /api/auth/signup**: Register a new user.
- **POST /api/auth/logout**: Logout 
- **POST /api/auth/change-password**: Updating password in DB
- **DELETE /api/auth/delete-account**: Delete user from DB

### Profile

- **GET /api/profile**: Get the profile of the logged-in user.
- **PUT /api/profile**: Update the profile of the logged-in user.
- **POST /api/profile/change-email**: Change the email of the logged-in user.
- **POST /api/profile/change-username**: Change the username of the logged-in user.
- **GET /api/profile/get-profile**: Get detailed profile information of the logged-in user.
- **POST /api/profile/changeProfilePicture**: Change the profile picture of the logged-in user.
- **DELETE /api/profile/removeProfilePicture**: Remove the profile picture of the logged-in user.

### Trips

- **GET /api/trips/getTrips**: Get all trips.
- **GET /api/trips/getUserTrips**: Get trips of the logged-in user.
- **POST /api/trips/createTrip**: Create a new trip.
- **DELETE /api/trips/deleteTrip/:tripId**: Delete a trip by its ID.

### Maps

- **GET /api/maps/routes**: Fetch routes.
- **POST /api/maps/fetchWaypoints**: Fetch waypoints.
- **POST /api/maps/fetchPoisForWaypoints**: Fetch points of interest for waypoints.
- **GET /api/maps/geocode**: Geocode a location.

## Environment Variables

- `DB_HOST=key`
- `DB_USER=key`
- `DB_PASSWORD=key`
- `DB_NAME=key`
- `PORT=key`
- `JWT_SECRET=key`
- `BLOB_READ_WRITE_TOKEN=key`
- `OPEN_AI_API_KEY=key`
- `GOOGLE_MAPS_API_KEY=key`