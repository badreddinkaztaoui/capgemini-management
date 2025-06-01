# Capgemini Management

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Project Overview

Capgemini Management is a modern web application built with Next.js 15.3.2, featuring a robust tech stack including MongoDB for data storage, authentication with JWT, and a beautiful UI powered by Tailwind CSS and Headless UI components.

## Tech Stack

- **Framework**: Next.js 15.3.2
- **Runtime**: React 19
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Styling**: Tailwind CSS 4
- **UI Components**:
  - Headless UI
  - Heroicons
  - Lucide React
- **Data Processing**: XLSX for Excel file handling

## Project Structure

```
src/
├── app/          # Next.js app directory (pages and layouts)
├── components/   # Reusable React components
├── lib/          # Library code and configurations
├── models/       # MongoDB/Mongoose models
└── utils/        # Utility functions and helpers
```

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- MongoDB instance
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd capgemini-management
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint for code quality checks

## Features

- Modern React with Next.js App Router
- MongoDB integration with Mongoose
- JWT-based authentication
- Excel file processing capabilities
- Responsive UI with Tailwind CSS
- Component-based architecture
- Type-safe development

## Development Guidelines

1. **Code Style**: Follow ESLint configuration for consistent code style
2. **Component Structure**: Place reusable components in `src/components`
3. **Data Models**: Define MongoDB schemas in `src/models`
4. **API Routes**: Create API endpoints in `src/app/api`
5. **Utility Functions**: Store helper functions in `src/utils`

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
