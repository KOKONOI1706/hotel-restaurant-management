# Hotel & Restaurant Management System

A complete web application for managing hotel and restaurant operations built with Next.js 14+, TypeScript, TailwindCSS, and MongoDB Atlas.

## 🌟 Features

### 🏨 Hotel Management
- **Room Management**: CRUD operations for rooms with types, pricing, status tracking
- **Customer Management**: Customer profiles, booking history, contact information
- **Booking System**: Reservation management with check-in/check-out tracking
- **Invoicing**: Automated billing with room charges, services, and taxes

### 🍽️ Restaurant Services
- **Service Management**: Menu items, pricing, categories (food, beverage, spa, etc.)
- **Order Tracking**: Service orders linked to room bookings

### 📊 Analytics & Reporting
- **Dashboard**: Real-time statistics and key performance indicators
- **Revenue Analytics**: Daily, monthly, and yearly revenue tracking
- **Room Status**: Visual representation of room availability
- **Booking Trends**: Historical booking data and patterns

### 🔐 Authentication & Authorization
- **JWT-based Authentication**: Secure login system
- **Role-based Access**: Admin and staff user roles
- **Session Management**: Persistent login sessions

### 🎨 User Interface
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Modern UI**: Clean and intuitive interface
- **Real-time Updates**: Dynamic data fetching and updates
- **Interactive Charts**: Revenue trends and room status visualization

## 🚀 Technology Stack

### Frontend
- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **Heroicons**: Beautiful SVG icons
- **Recharts**: Interactive chart library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB Atlas**: Cloud-based NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Token authentication
- **bcryptjs**: Password hashing

### Development Tools
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hotel-restaurant-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/hotel-restaurant-db?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Database Setup
1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Update the `MONGODB_URI` in your `.env.local` file
4. Seed the database with sample data:

```bash
# Start the development server
npm run dev

# In another terminal, seed the database
curl -X POST http://localhost:3000/api/seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

## 👤 Demo Credentials

### Administrator
- **Username**: `admin`
- **Password**: `admin123`

### Staff
- **Username**: `staff`
- **Password**: `staff123`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── rooms/         # Room management APIs
│   │   ├── customers/     # Customer management APIs
│   │   ├── dashboard/     # Dashboard data APIs
│   │   └── seed/          # Database seeding
│   ├── dashboard/         # Protected dashboard pages
│   │   ├── rooms/         # Room management page
│   │   └── layout.tsx     # Dashboard layout
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Login page
├── components/            # Reusable components
│   └── ui/               # UI components
│       └── Sidebar.tsx   # Navigation sidebar
├── lib/                  # Utility libraries
│   ├── mongodb.ts        # Database connection
│   ├── models.ts         # Mongoose schemas
│   ├── auth.ts           # Authentication utilities
│   └── middleware.ts     # API middleware
└── types/                # TypeScript definitions
    └── index.ts          # Type definitions
```

## 🗄️ Database Schema

### Collections

#### Users
- Authentication and authorization
- Role-based access (admin/staff)

#### Rooms
- Room details, pricing, status
- Amenities and descriptions

#### Customers
- Guest information and contact details
- Booking history tracking

#### Bookings
- Reservation management
- Check-in/check-out tracking
- Status management

#### Services
- Additional services and pricing
- Categories (food, spa, transport, etc.)

#### Invoices
- Billing and payment tracking
- Room and service charges
- Tax calculations

## 🚀 Deployment

### Vercel Deployment

1. **Prepare for Deployment**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel Dashboard
   - Navigate to your project settings
   - Add the environment variables from `.env.local`

4. **Update Environment Variables**
   ```env
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

### Environment Variables for Production
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Secure JWT signing key (32+ characters)
- `NEXTAUTH_SECRET`: NextAuth.js secret key
- `NEXTAUTH_URL`: Your production domain

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only)

### Rooms
- `GET /api/rooms` - List rooms with filtering
- `POST /api/rooms` - Create new room
- `GET /api/rooms/[id]` - Get room details
- `PUT /api/rooms/[id]` - Update room
- `DELETE /api/rooms/[id]` - Delete room

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer details
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics and analytics

### Database
- `POST /api/seed` - Seed database with sample data

## 🔧 Development Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Code linting
npm run lint

# Type checking
npm run type-check
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- MongoDB team for the cloud database platform
- Heroicons for the beautiful icon set
- Recharts for the chart components

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced reporting with PDF export
- [ ] Multi-language support
- [ ] Mobile application
- [ ] Integration with payment gateways
- [ ] Advanced analytics and forecasting
- [ ] Email automation
- [ ] Calendar integration
- [ ] Inventory management
- [ ] Staff scheduling system

## 📞 Support

For support, email support@hotel-management.com or create an issue in the repository.

---

Built with ❤️ using Next.js, TypeScript, and MongoDB Atlas
#   h o t e l - r e s t a u r a n t - m a n a g e m e n t  
 