# NeonKeys - Gaming E-Commerce Platform

## Overview

NeonKeys is a Brazilian gaming e-commerce platform for selling digital game keys. The application provides a modern, dark-themed marketplace inspired by ThunderKeys.com where users can browse, search, and purchase digital game keys for platforms like Steam, Epic Games, GOG, Xbox, and PlayStation. The platform features product browsing with price filters, shopping cart functionality, user authentication, and a responsive mobile-first design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for path aliases (@/, @shared/, @assets/)
- **State Management**: TanStack React Query for server state and data fetching
- **Styling**: Tailwind CSS with custom dark theme and CSS variables for theming
- **Component Library**: shadcn/ui (New York style) built on Radix UI primitives
- **Routing**: Custom client-side navigation using React state (no router library)

The frontend follows a component-based architecture with:
- Page components in `client/src/pages/`
- Reusable UI components in `client/src/components/`
- shadcn/ui primitives in `client/src/components/ui/`
- Example components for development in `client/src/components/examples/`

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES Modules
- **API Design**: RESTful JSON API under `/api` prefix
- **Session Management**: Session-based with client-generated session IDs stored in localStorage

Key API endpoints:
- `GET /api/products` - List products with optional filters (maxPrice, platform, search)
- `GET /api/products/:id` - Get single product
- `GET /api/cart` - Get cart items for session
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart/:productId` - Update cart item quantity
- `DELETE /api/cart/:productId` - Remove item from cart

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Migrations**: Managed via `drizzle-kit push`

Database tables:
- `users` - User accounts with bcrypt-hashed passwords
- `products` - Game listings with pricing, platform, discount info
- `cart_items` - Shopping cart items linked to sessions

### Authentication
- Password hashing using bcryptjs
- Session-based cart management using client-generated UUIDs
- User registration and login endpoints planned

### Design System
The platform follows specific design guidelines (see `design_guidelines.md`):
- Dark gaming-focused interface with green neon accents
- Inter/Poppins for headings, system fonts for body text
- Product card grid layout (2-5 columns responsive)
- Fixed header with search, collapsible sidebar navigation

## External Dependencies

### Database
- PostgreSQL (connection via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database queries
- `connect-pg-simple` for session storage capability

### Frontend Libraries
- Radix UI primitives (dialog, dropdown, accordion, etc.)
- Lucide React and React Icons for iconography
- `react-day-picker` for calendar components
- `embla-carousel-react` for carousels
- `vaul` for drawer components
- `cmdk` for command palette

### Development Tools
- Vite with React plugin and HMR
- Replit-specific plugins for dev banner and error overlay
- esbuild for production server bundling

### Styling
- Tailwind CSS with custom configuration
- `class-variance-authority` for component variants
- `tailwind-merge` and `clsx` for class composition