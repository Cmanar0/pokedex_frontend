# Pokédex Frontend

A Vue.js-based frontend application that provides an interactive interface for exploring and managing Pokémon data. This repo serves as the frontend part of a showcase project that integrates with a custom backend API to display and interact with Pokémon data. 

## Features

- Responsive grid layout for Pokémon cards
- Real-time search and filtering by name, type, and abilities
- Detailed Pokémon information display
- User authentication (login/register)
- Favorite Pokémon management
- Pokémon comparison tool
- Infinite scroll pagination

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Project Structure

```
pokedex_frontend/
├── src/
│   ├── api/             # API endpoints
│   ├── assets/          # Static assets (variables)
│   ├── components/      # Reusable Vue components
│   ├── pages/          # Pages
│   ├── router/         # Vue Router configuration
│   ├── services/       # Service layer for API calls
│   ├── stores/         # Pinia stores for state management
│   ├── App.vue         # Root component
│   ├── main.js         # Application entry point
│   └── style.css       # Global styles
├── package.json        # Project dependencies
└── README.md          # Project documentation
```

## Implementation Notes

### Key Features and Solutions

1. **State Management**
   - Pinia stores for centralized state management
   - Reactive data handling for real-time updates
   - Persistent authentication state

2. **User Interface**
   - Responsive grid layout with CSS Grid
   - Custom card components for Pokémon display

3. **Performance Optimizations**
   - Lazy loading of components
   - Infinite scroll for pagination


