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
  - [Database Structure](#database-structure)

## Tech Stack 🛠️

- **Node.js**
- **Express**
- **MySQL**
- **Vercel**
- **OpenAI API**
- **OpenStreetMaps API**

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

## Database Structure 

### Users Table

| Column          | Type         | Description                        |
|-----------------|--------------|------------------------------------|
| `userId`        | INT          | Primary key, auto-increment        |
| `username`      | VARCHAR(255) | Username of the user               |
| `email`         | VARCHAR(255) | Email of the user                  |
| `password`      | VARCHAR(255) | Hashed password                    |
| `created_at`    | TIMESTAMP    | Timestamp of account creation      |
| `profile_picture`| VARCHAR(255)| URL to the profile picture         |

### Trips Table

| Column            | Type         | Description                        |
|-------------------|--------------|------------------------------------|
| `tripId`          | INT          | Primary key, auto-increment        |
| `userId`          | INT          | Foreign key referencing `userId`   |
| `trip_name`       | VARCHAR(255) | Name of the trip                   |
| `trip_description`| TEXT         | Description of the trip            |
| `start_date`      | DATE         | Start date of the trip             |
| `end_date`        | DATE         | End date of the trip               |
| `destination`     | VARCHAR(255) | Destination of the trip            |
| `openai_response` | TEXT         | Response from OpenAI API           |
| `starting_location`| VARCHAR(255)| Starting location of the trip      |
