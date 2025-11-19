# Ekami Auto - Car Rental, Sales & Repairs Platform

A modern, full-featured car rental, sales, and repair platform for Cameroon built with React, TypeScript, Tailwind CSS, and modern web technologies.

## Features

### Core Functionality
- **Car Rentals**: Browse and rent cars by category, location, and price
- **Car Sales**: Buy and sell cars with price estimation
- **Repairs & Services**: Book repair services and maintenance
- **AI Assistant**: Intelligent chatbot with voice input for car search and recommendations
- **Multi-language**: Seamless EN/FR toggle
- **Dark Mode**: Full dark mode support
- **WhatsApp Integration**: Direct chat for inquiries
- **Loyalty Program**: Earn points for bookings, referrals, and reviews

### Advanced Features
- 360° car views and video walkthroughs
- Car comparison tool
- Smart AI-powered filters
- Price estimator for sellers
- Delivery cost calculation
- Calendar integration for bookings
- Push notifications
- Blog with AI-generated summaries
- Interactive maps (Leaflet)
- Payment integration (MTN/Orange Money, Stripe)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Material-UI
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Authentication**: Clerk
- **Backend/Database**: Supabase
- **Payments**: Stripe
- **i18n**: i18next + react-i18next
- **Forms**: React Hook Form + Formik + Yup
- **Maps**: Leaflet + React Leaflet
- **Charts**: Chart.js + React Chartjs 2
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Clerk account (for authentication)
- A Supabase account (for database)
- A Stripe account (for payments)
- OpenAI API key (for AI assistant)

### Installation

1. **Clone or navigate to the project**:
   ```bash
   cd ekami-cars
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Fill in your credentials:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   VITE_OPENAI_API_KEY=your_openai_key
   VITE_WHATSAPP_NUMBER=237XXXXXXXXX
   VITE_GOOGLE_MAPS_API_KEY=your_maps_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
ekami-cars/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── common/      # Layout, Header, Footer, etc.
│   │   ├── ai/          # AI Chat component
│   │   └── ...
│   ├── contexts/        # React contexts (Auth, Language, Theme)
│   ├── pages/           # Page components
│   ├── lib/             # Utilities and configs (theme, etc.)
│   ├── services/        # API services (Supabase, etc.)
│   ├── types/           # TypeScript types
│   ├── i18n.ts          # i18n configuration
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── locales/             # Translation files (en, fr)
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Key Pages

- `/` - Homepage with hero, search, and categories
- `/rent` - Car rental listings
- `/buy` - Cars for sale
- `/repairs` - Repair services
- `/sell` - Sell your car form
- `/cars/:id` - Car detail page
- `/compare` - Compare cars side-by-side
- `/blog` - Blog and tips
- `/account` - User dashboard
- `/sign-in`, `/sign-up` - Authentication

## Configuration

### Clerk Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Enable email/password and social sign-in
3. Copy your publishable key to `.env`

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create tables for:
   - `cars` (id, title, brand, model, year, price, category, location, images, etc.)
   - `bookings` (id, user_id, car_id, start_date, end_date, status, etc.)
   - `reviews` (id, user_id, car_id, rating, comment, etc.)
   - `listings` (for user-submitted cars to sell)
3. Copy your URL and anon key to `.env`

### Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your publishable key
3. Set up payment methods for Cameroon (MTN/Orange Money via local PSP)

### OpenAI Setup

1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. Add to `.env`
3. Implement AI chat in `src/components/ai/AIChat.tsx`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

The `vercel.json` file is already configured for SPA routing.

### Other Platforms

The app can be deployed to:
- Netlify
- Cloudflare Pages
- AWS Amplify
- Any static hosting service

## Customization

### Branding

- Update colors in `tailwind.config.js` (ekami-blue, ekami-gold)
- Replace logo in `src/components/common/Header.tsx` and `Footer.tsx`
- Update meta tags in `index.html`

### Translations

Add or modify translations in:
- `locales/en/translation.json`
- `locales/fr/translation.json`

### Theme

Customize MUI theme in `src/lib/theme.ts`

## Development Roadmap

### Phase 1 (Current - MVP)
- [x] Project setup and configuration
- [x] Core pages and routing
- [x] Layout with Header/Footer
- [x] i18n (EN/FR)
- [x] Dark mode
- [x] AI Chat UI
- [ ] Car listings with filters
- [ ] Car detail page with gallery
- [ ] Booking flow
- [ ] Sell car form with image upload

### Phase 2
- [ ] Supabase integration
- [ ] Clerk authentication flow
- [ ] Real AI assistant (OpenAI)
- [ ] Payment integration
- [ ] WhatsApp Business API
- [ ] Email/SMS notifications
- [ ] Admin dashboard

### Phase 3
- [ ] 360° car viewer
- [ ] Video uploads
- [ ] Map integration for delivery
- [ ] Loyalty program backend
- [ ] Push notifications (PWA)
- [ ] Blog CMS
- [ ] Analytics dashboard

## Contributing

This is a private project. For questions or support, contact the development team.

## License

Proprietary - All rights reserved © 2024 Ekami Auto

## Support

For technical support or questions:
- Email: dev@ekamiauto.cm
- WhatsApp: +237 XXX XXX XXX
