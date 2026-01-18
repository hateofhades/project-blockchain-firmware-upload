# Contract Blockchain Project

This project is a blockchain application that includes both backend and frontend components. The backend is built using Node.js and Express, while the frontend is developed with React and Vite.

## Running the Application

To run the application, follow these steps:

1. **Install Dependencies**: `npm install` in the root and `frontend/` directories
2. **Build the Frontend**: `npm run build-devnet` in the `frontend/` directory
3. **Start the Backend**: `npm run dev` in the root

## Frontend Access

The frontend is served under the `/ui` path. Once the backend server is running, you can access the frontend by navigating to `http://localhost:3000/ui` in your web browser.

## Device Paths

The application provides 2 device paths for easier access to the contract:

- `/all` - Retrieves all firmware releases.
- `/latestRelease` - Retrieves the latest firmware release.
