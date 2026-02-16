# Astrology SaaS Platform

A scalable astrology platform with natal chart generation, personality analysis, and predictive forecasting capabilities.

## Features

- **Natal Chart Generation**: High-precision astronomical calculations using Swiss Ephemeris
- **Personality Analysis**: Detailed interpretations of planetary positions, aspects, and houses
- **Transit Forecasting**: Real-time transit tracking with predictive insights
- **User Management**: Secure authentication with profile and chart management
- **PWA Support**: Progressive Web App for mobile experience

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
| **Frontend** | React + Vite |
| **Mobile** | PWA (Progressive Web App) |
| **Calculation** | Swiss Ephemeris (swisseph npm) |
| **UI Design** | Stitch MCP |

## Project Structure

```
astrology-saas-platform/
├── backend/              # Node.js/Express API server
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Helper functions
│   │   └── server.ts     # Entry point
│   └── package.json
├── frontend/             # React PWA application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom hooks
│   │   ├── utils/        # Helper functions
│   │   └── main.tsx      # Entry point
│   └── package.json
├── packages/             # Shared packages
│   ├── shared-types/     # TypeScript types
│   └── shared-utils/     # Shared utilities
├── .env.example          # Environment variables template
├── package.json          # Root package.json
├── task_plan.md          # Development plan
├── findings.md           # Research findings
└── progress.md           # Progress log
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 14
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/astrology-saas-platform.git
   cd astrology-saas-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   The backend will run on http://localhost:3001
   The frontend will run on http://localhost:3000

## API Documentation

API documentation will be available at `/api/docs` when running in development mode.

## Development Workflow

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

### Starting Production Server
```bash
npm run start
```

## Deployment

### Backend
- Build: `npm run build:backend`
- Start: `npm run start:backend`

### Frontend
- Build: `npm run build:frontend`
- The built files will be in `frontend/dist/`
- Serve with a static file server or deploy to Vercel/Netlify

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT

## Acknowledgments

- [Swiss Ephemeris](https://www.astro.com/swisseph/) for astronomical calculations
- [Stitch](https://stitch.withgoogle.com/) for UI design assistance
