# Project Summary
Rifas Pix Online is a web application designed for running raffles (or lotteries) efficiently and transparently. It allows users to purchase raffle numbers, participate in draws, and manage payments using the PIX payment system. The application offers an admin panel for managing orders and results, ensuring a seamless experience for both organizers and participants.

# Project Module Description
- **Admin Panel**: Manage orders, view statistics, and control raffle settings.
- **Raffle Management**: Display available numbers, handle reservations, and conduct draws.
- **Firebase Integration**: Real-time synchronization of raffle data and user interactions.

# Directory Tree
```
.
├── index.html          # Main HTML file for the application
├── js
│   ├── app.js         # Core application logic (admin, orders, draws)
│   ├── firebase-config.js  # Firebase configuration and functionality
│   └── rifa-renderer.js    # Raffle number rendering and UI interactions
└── css                # Directory for future CSS styles
```

# File Description Inventory
- **index.html**: The main entry point of the application, containing the HTML structure and links to JavaScript files.
- **js/app.js**: Contains the main logic for managing the raffle, including order handling and admin functions.
- **js/firebase-config.js**: Handles Firebase initialization and real-time data management.
- **js/rifa-renderer.js**: Responsible for rendering raffle numbers and managing user interactions.

# Technology Stack
- HTML
- CSS (future styles)
- JavaScript
- Firebase (for real-time database functionality)

# Usage
1. **Installation**: Clone the repository and navigate to the project directory.
2. **Dependencies**: Ensure you have a local server to serve the files (e.g., using `http-server` or similar).
3. **Run the Application**: Open `index.html` in a web browser or serve it through a local server.
