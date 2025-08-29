# Vercel Environment Variables Setup
# Run these commands in your terminal after installing Vercel CLI

# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Link your project to Vercel (if not already linked)
vercel link

# 4. Set environment variables
vercel env add MONGODB_URI
# When prompted, enter: mongodb+srv://nguyenduycongtm:QlEGAThNOXa16lAU@cluster0.3jubiai.mongodb.net/hotel-restaurant-db?retryWrites=true&w=majority

vercel env add JWT_SECRET
# When prompted, enter: your-super-secret-jwt-key-minimum-32-characters-here-for-security

vercel env add NEXTAUTH_SECRET  
# When prompted, enter: your-nextauth-secret-key-here

vercel env add NEXTAUTH_URL
# When prompted, enter: https://your-app-name.vercel.app (replace with your actual Vercel domain)

# 5. Deploy with environment variables
vercel --prod

# Alternative: Set via Vercel Dashboard
# Go to: https://vercel.com/dashboard
# Select your project > Settings > Environment Variables
# Add each variable with the values from your .env.local file
