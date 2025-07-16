# Replit.md - MapleStory Nickname Generator

## Overview

This is a full-stack web application for generating and checking MapleStory nicknames. The app allows users to generate random Korean nicknames, check their availability against the MapleStory API, and save favorites. It features a React frontend with TypeScript, Express backend, and uses Netlify Functions for external API calls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and building

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Style**: REST endpoints for internal operations
- **Development**: Hot reloading with Vite middleware integration
- **Storage**: In-memory storage (MemStorage) for development, designed for future database integration

### Serverless Functions
- **Platform**: Netlify Functions for external API calls
- **Purpose**: Proxy requests to avoid CORS issues and handle API keys securely
- **Functions**: 
  - `dictionary.ts` - Fetches Korean dictionary words
  - `nickname-check.ts` - Checks nickname availability via MapleStory API

## Key Components

### Core Features
1. **Nickname Generation**
   - Random Korean syllable generation
   - Real dictionary word integration (planned)
   - Configurable options (length, type, filters)

2. **Availability Checking**
   - Real-time MapleStory API integration
   - Batch checking with rate limiting
   - Caching for performance

3. **Nickname Management**
   - Save favorites to localStorage
   - Copy to clipboard functionality
   - Status tracking (free/busy/error)

### UI Components
- **GenerateModal**: Advanced options for nickname generation
- **NicknameChip**: Individual nickname display with status
- **ResultsList**: Tabbed results with filtering
- **SavedNicknames**: Persistent favorites management

### Utility Libraries
- **korean-utils**: Korean text processing and syllable generation
- **storage**: localStorage wrapper for persistence
- **api**: Type-safe API client with error handling

## Data Flow

1. **Generation Flow**:
   - User configures options in GenerateModal
   - Frontend calls generation logic (random or dictionary-based)
   - Results displayed with loading states
   - Background availability checking via Netlify Functions

2. **Checking Flow**:
   - User inputs nicknames or generates them
   - Batch API calls to check availability
   - Results cached and displayed with status indicators
   - Real-time updates as checks complete

3. **Persistence Flow**:
   - User saves favorites to localStorage
   - Automatic cleanup (50 item limit)
   - Cross-session persistence

## External Dependencies

### APIs
- **MapleStory Open API**: For nickname availability checking
- **Korean Standard Dictionary API**: For real word generation (planned)

### Key Libraries
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI components
- **drizzle-orm**: Database ORM (configured for future PostgreSQL)
- **zod**: Schema validation
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing

### Development Tools
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution
- **esbuild**: Fast bundling for production

## Deployment Strategy

### Development
- Vite dev server with Express middleware
- Hot reloading for both frontend and backend
- In-memory storage for rapid iteration

### Production
- **Frontend**: Static files served via Vite build
- **Backend**: Express server bundled with esbuild
- **Functions**: Netlify Functions for external API calls
- **Database**: Prepared for PostgreSQL with Drizzle ORM

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection (future)
- `NEXON_API_KEY`: MapleStory API authentication
- `DICT_API_KEY`: Korean dictionary API key (planned)

### Database Schema
Designed for PostgreSQL with three main tables:
- `users`: User authentication (future feature)
- `nickname_checks`: Cached availability results with TTL
- `generated_nicknames`: Analytics and generation history

The application is structured for easy scaling, with clear separation between client-side generation, server-side caching, and external API integration through serverless functions.