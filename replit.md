# Replit.md

## Overview

This is a luxury vacation rental booking application built with React (frontend) and Express.js (backend). The system allows users to browse property images, make reservations, and submit contact inquiries. It features a modern, responsive design using shadcn/ui components and showcases high-end property amenities through an interactive image gallery with slideshow functionality.

## User Preferences

Preferred communication style: Simple, everyday language.
Visual Editor: Primary interface for content management, not an additional feature.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with JSON responses
- **Data Validation**: Zod schemas for request/response validation
- **Storage**: In-memory storage implementation with interface for future database integration
- **Development**: Hot module replacement with Vite middleware integration

### Data Storage Solutions
- **Current**: In-memory storage using Maps for users, bookings, and contacts
- **Prepared for**: PostgreSQL database with Drizzle ORM configuration
- **Schema**: Defined database tables for users, bookings, and contacts with proper relationships and constraints

### Authentication and Authorization
- **Session Management**: Connect-pg-simple for PostgreSQL session storage (configured but not actively used with current in-memory storage)
- **User System**: Basic user model with username/password authentication prepared

### Design Patterns
- **Repository Pattern**: Storage interface (IStorage) allows switching between in-memory and database implementations
- **Component Composition**: Reusable UI components following shadcn/ui patterns
- **Form Validation**: Centralized Zod schemas shared between frontend and backend
- **Error Handling**: Structured error responses with proper HTTP status codes

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive collection of UI primitives for accessible components
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Modern icon library for consistent iconography
- **Class Variance Authority**: Type-safe variant API for component styling

### Data and Forms
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation library
- **Drizzle ORM**: Type-safe SQL ORM with PostgreSQL support

### Development Tools
- **Vite**: Fast build tool with HMR and development server
- **TypeScript**: Static type checking for improved developer experience
- **ESBuild**: Fast JavaScript bundler for production builds

### Database (Configured)
- **Neon Database**: Serverless PostgreSQL database service
- **Drizzle Kit**: Database migration and schema management tools

### Utilities
- **Date-fns**: Modern date utility library for date formatting and manipulation
- **clsx/twMerge**: Conditional CSS class name utilities
- **Wouter**: Minimalist routing library for React applications