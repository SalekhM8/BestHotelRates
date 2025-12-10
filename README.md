# Best Hotel Rates - Full Stack Booking Platform

A modern, full-stack hotel booking platform with glassmorphism UI design, built with Next.js 14, TypeScript, Prisma, and Stripe.

## 🎯 Project Status

**Phase 1 Complete** ✅
- Next.js 14 project initialized with TypeScript
- Glassmorphism design system implemented
- Core UI components created
- Homepage with search and hotel listings migrated
- Database schema designed and migrated
- Development environment fully configured

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Glassmorphism
- **State Management**: Zustand (installed, ready to use)
- **Form Handling**: React Hook Form + Zod (installed, ready to use)
- **Animations**: Framer Motion (installed, ready to use)

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (installed, ready to configure)
- **Payments**: Stripe (installed, ready to configure)
- **Email**: Resend (installed, ready to configure)

## 📂 Project Structure

```
best-hotel-rates-app/
├── app/
│   ├── layout.tsx          # Root layout with video background
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles with glassmorphism
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── GlassCard.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── layout/              # Layout components
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   └── VideoBackground.tsx
│   └── hotel/               # Hotel-specific components
│       ├── HotelCard.tsx
│       └── SearchBar.tsx
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   └── utils.ts            # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
└── public/
    ├── hotel.mp4           # Mobile video background
    └── hotelDESKTOP.mp4    # Desktop video background
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation Steps

1. **Install Dependencies** (Already done ✅)
   ```bash
   npm install
   ```

2. **Set Up Database** (Already done ✅)
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Generate Prisma Client** (Already done ✅)
   ```bash
   npx prisma generate
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to `http://localhost:3000`

## 🎨 Design System

### Glassmorphism Components

All components use a consistent glassmorphism design:

```css
background: rgba(135, 206, 250, 0.15);
backdrop-filter: blur(20px);
border-radius: 24px;
border: 1px solid rgba(255, 255, 255, 0.2);
```

### Color Palette
- **Primary Glass**: `rgba(135, 206, 250, 0.15)` - Baby blue tint
- **Glass Hover**: `rgba(135, 206, 250, 0.25)`
- **Background**: `#0a0e27` - Dark blue
- **Text Primary**: `#ffffff` - White
- **Text Secondary**: `rgba(255, 255, 255, 0.8)`

### Components Available
- `GlassCard` - Card container with glassmorphism
- `Button` - Button with multiple variants
- `Input` - Form input with glass styling
- `Modal` - Modal dialog with backdrop
- `HotelCard` - Hotel listing card
- `SearchBar` - Search interface with filters

## 📊 Database Schema

### Models
- **User** - User accounts with authentication
- **Session** - User sessions for NextAuth
- **Booking** - Hotel bookings with payment info
- **Wishlist** - User's saved hotels
- **Admin** - Admin user accounts
- **EmailLog** - Email tracking

View full schema in `prisma/schema.prisma`

## 🔐 Environment Variables

Required environment variables (add to `.env`):

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth (generate secret: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# ETG API
ETG_API_URL="https://api.etg.com"
ETG_API_KEY="your-key"
ETG_API_SECRET="your-secret"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Resend)
RESEND_API_KEY="re_..."
FROM_EMAIL="bookings@besthotelrates.com"
ADMIN_EMAIL="admin@besthotelrates.com"
```

## 🎯 Next Steps (Phase 2 - Authentication)

### Immediate Next Tasks:
1. Configure NextAuth.js with credentials provider
2. Create login/register pages
3. Implement password hashing with bcrypt
4. Add email verification flow
5. Create protected routes
6. Build user profile page

### Future Phases:
- Phase 3: ETG API Integration
- Phase 4: Hotel Search & Discovery
- Phase 5: Wishlist Feature
- Phase 6: Booking Flow
- Phase 7: Stripe Payment Integration
- Phase 8: Email Notifications
- Phase 9: User Dashboard
- Phase 10: Admin Dashboard
- Phase 11: Static Pages
- Phase 12: Testing & QA
- Phase 13: SEO Optimization
- Phase 14: Deployment
- Phase 15: Post-Launch Monitoring

See full roadmap in `PROJECT_PLAN.md` at project root.

## 🧪 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Prisma commands
npx prisma studio          # Open Prisma Studio
npx prisma generate        # Generate Prisma Client
npx prisma migrate dev     # Create new migration
npx prisma db push         # Push schema changes (development)
```

## 📝 Available Scripts

- `dev` - Start development server with Turbopack
- `build` - Create production build
- `start` - Run production server
- `lint` - Run ESLint

## 🎨 Features Implemented

### Phase 1 Features ✅
- [x] Next.js 14 project with TypeScript
- [x] Tailwind CSS with custom glassmorphism styles
- [x] Video background (mobile & desktop)
- [x] Responsive header with login button
- [x] Search bar with filters
- [x] Hotel card grid layout
- [x] Bottom navigation (mobile)
- [x] Reusable UI component library
- [x] Database schema and migrations
- [x] Project structure and folders

### Upcoming Features
- [ ] User authentication system
- [ ] Hotel search with ETG API
- [ ] Real-time availability checking
- [ ] Wishlist functionality
- [ ] Booking flow
- [ ] Stripe payment integration
- [ ] Email notifications
- [ ] User dashboard
- [ ] Admin panel
- [ ] And much more...

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📄 License

Private - All Rights Reserved

---

**Built with ❤️ using Next.js 14, TypeScript, and modern web technologies**

**Status**: Phase 1 Complete - Ready for Phase 2 (Authentication) 🚀
