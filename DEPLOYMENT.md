# Hotel & Restaurant Management System - Deployment Guide

## 🚀 Deploy to Vercel

### 1. Prerequisites
- MongoDB Atlas database
- Vercel account
- Git repository

### 2. Environment Variables Setup

Create the following environment variables in Vercel dashboard:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hotel-restaurant-db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-project.vercel.app

# Optional: Email & Invoice Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Company Information
COMPANY_NAME=Your Hotel Name
COMPANY_ADDRESS=Your Hotel Address
COMPANY_PHONE=Your Phone Number
```

### 3. Deployment Steps

#### Option 1: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Redeploy with environment variables
vercel --prod
```

#### Option 2: Deploy via GitHub Integration
1. Push code to GitHub repository
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### 4. Post-Deployment Setup

1. **Seed Database** (if needed):
   ```bash
   curl -X POST https://your-project.vercel.app/api/seed
   ```

2. **Test Login**:
   - Admin: `admin` / `admin123`
   - Staff: `staff` / `staff123`

3. **Configure MongoDB Atlas**:
   - Whitelist Vercel IP addresses
   - Enable MongoDB Atlas connection

### 5. Production Considerations

#### Database
- Use MongoDB Atlas (recommended)
- Set up proper indexes
- Configure backup strategy
- Monitor performance

#### Security
- Use strong JWT secrets
- Enable HTTPS only
- Configure CORS properly
- Set up rate limiting

#### Performance
- Enable Next.js optimizations
- Use CDN for static assets
- Implement caching strategies
- Monitor with Vercel Analytics

### 6. Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `NEXTAUTH_SECRET` | NextAuth.js secret | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |
| `SMTP_HOST` | Email server host | ⚪ |
| `SMTP_USER` | Email username | ⚪ |
| `SMTP_PASS` | Email password | ⚪ |
| `COMPANY_NAME` | Hotel/Company name | ⚪ |

### 7. Troubleshooting

#### Common Issues:
- **MongoDB Connection**: Check Atlas IP whitelist
- **Environment Variables**: Verify all required vars are set
- **Build Errors**: Check TypeScript errors locally first
- **API Routes**: Ensure serverless function limits

#### Debug Commands:
```bash
# Check build locally
npm run build

# Type check
npm run type-check

# View deployment logs
vercel logs
```

## 📱 Features Available in Production

- ✅ Customer booking system
- ✅ Admin dashboard
- ✅ Room management
- ✅ Service management
- ✅ Booking management
- ✅ Real-time analytics
- ✅ Responsive design
- ✅ JWT authentication

## 🔗 Live Demo
After deployment, your application will be available at:
`https://your-project-name.vercel.app`

## 🏨 Default Login Credentials
- **Admin**: `admin` / `admin123`
- **Staff**: `staff` / `staff123`

**⚠️ Remember to change default passwords in production!**
