# CIMARA Inventory Management System

A comprehensive equipment inventory management system for CIMARA Ltd., based in Yaounde, Cameroon. The system manages equipment across five construction sites and streamlines equipment tracking, withdrawals, receipts, and reporting.

## Features

- **Engineer Registration**: Register engineers and assign them to CIMARA's 5 construction sites (ENAM, MINFOPRA, SUP'PTIC, ISMP, SDP)
- **Equipment Management**: Add equipment to inventory with units (pieces, packets, meters, etc.) and track quantities in real-time
- **Equipment Withdrawal**: Record multi-item equipment withdrawals with receiver and sender details
- **Receipt Management**: Auto-generated receipt numbers, professional CIMARA-branded receipts with logo and slogan
- **Multi-Site Reports**: Export withdrawal data by site (5 separate Excel sheets - one per site)
- **Daily & Weekly Reports**: Generate comprehensive reports for equipment usage by site
- **Export Functionality**: Export reports to PDF, Excel (with multi-site support), and Word formats
- **Low Stock Alerts**: Get notified when equipment reaches low stock levels (<5 units)
- **Dashboard Statistics**: Real-time inventory metrics and system status

## CIMARA Sites

- ENAM
- MINFOPRA
- SUP'PTIC
- ISMP
- SDP

## Technology Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19.2**: Latest React features
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first CSS framework with custom design tokens
- **shadcn/ui**: High-quality UI components
- **XLSX**: Excel export with multi-sheet support
- **jsPDF**: PDF export with professional formatting

### Backend
- **Next.js API Routes**: Serverless backend functions
- **MongoDB**: NoSQL database for data persistence
- **TypeScript**: Type-safe API development

### Design
- **CIMARA Colors**: Primary purple (#7B2CBF) and secondary yellow (#FFD60A)
- **Logo & Branding**: Professional CIMARA logo with "Quality brings reliability" slogan on all transactions
- **Responsive Design**: Mobile-first approach optimized for tablets and desktops

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB Free Tier account (Atlas)
- npm or yarn package manager
- Git (for version control)

### Step 1: MongoDB Free Setup (MongoDB Atlas)

MongoDB is **FREE** for development! Follow these steps:

#### 1.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Sign Up for Free"**
3. Create your account with email/password
4. Verify your email address

#### 1.2 Create a Free M0 Cluster

1. Log in to Atlas Dashboard
2. Click **"Create a Deployment"**
3. Select **M0 (Free Tier)**
4. Choose your preferred region (e.g., Africa - Cape Town for lowest latency)
5. Click **"Create Deployment"**
6. Wait 5-10 minutes for cluster creation

#### 1.3 Create Database User

1. In the Atlas Dashboard, go to **Database Access**
2. Click **"Add New Database User"**
3. Set username: `cimara_admin`
4. Set password: Create a strong password (save this!)
5. Database User Privileges: Select **"Built-in Role"** → **"Atlas admin"**
6. Click **"Add User"**

#### 1.4 Whitelist IP Address

1. Go to **Network Access** in Atlas
2. Click **"Add IP Address"**
3. Enter: `0.0.0.0/0` (allows connections from anywhere - safe for development)
4. Click **"Confirm"**

#### 1.5 Get Connection String

1. Go back to **Database** in Atlas
2. Click **"Connect"** next to your cluster
3. Select **"Drivers"** (not `mongosh`)
4. Copy the connection string (looks like):
   ```
   mongodb+srv://cimara_admin:PASSWORD@cluster0.mongodb.net/mydb?retryWrites=true&w=majority
   ```
5. Replace `PASSWORD` with your database user password
6. Replace `mydb` with `cimara_inventory`

### Step 2: Clone & Install Project

```bash
# Clone the project
git clone <repository-url>
cd cimara-inventory

# Install dependencies
npm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# MongoDB Connection String (from Step 1.5)
MONGODB_URI=mongodb+srv://cimara_admin:YOUR_PASSWORD@cluster0.mongodb.net/cimara_inventory?retryWrites=true&w=majority

# Application
NODE_ENV=development
PORT=3000
```

**⚠️ IMPORTANT**: Never commit `.env.local` to git! It's already in `.gitignore`

### Step 4: Run the Application

```bash
# Development server
npm run dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`

### Step 5: Initial Setup

1. **Open the application** at http://localhost:3000
2. **Register Engineers** tab:
   - Add engineer names
   - Select their assigned site from the dropdown
   - Click "Register Engineer"
3. **Add Equipment** tab:
   - Enter equipment name, category, serial number
   - Set initial quantity (with units: pieces, packets, meters, etc.)
   - Select storage location
   - Click "Add Equipment"
4. **Start Recording Withdrawals**:
   - Go to "Withdrawals" tab
   - Select engineer and site
   - Add receiver's name and sender's name
   - Select equipment and quantity
   - System auto-generates receipt number
5. **View Reports**:
   - Go to "Reports" tab
   - Select site and date range
   - Generate daily/weekly reports
   - Export to Excel (5 sheets), PDF, or Word

## Troubleshooting

### "Failed to register engineers" Error

**Problem**: Application shows connection error to MongoDB

**Solution**:

1. **Verify MongoDB Connection String**:
   - Check `.env.local` has correct connection string
   - Ensure password has no special characters (if it does, URL-encode them)
   - Replace `PASSWORD` with actual password

2. **Check MongoDB Atlas**:
   - Verify cluster is running (green status in Atlas)
   - Verify IP `0.0.0.0/0` is whitelisted in Network Access
   - Verify database user credentials match `.env.local`

3. **Test Connection**:
   ```bash
   # Install MongoDB tools
   npm install -g mongosh
   
   # Test connection
   mongosh "mongodb+srv://cimara_admin:PASSWORD@cluster0.mongodb.net/cimara_inventory"
   ```

4. **Restart Application**:
   ```bash
   npm run dev
   ```

### Equipment Quantity Shows Zero

**Solution**: Check if withdrawal exceeded available quantity. The system prevents over-withdrawal.

### Receipts Not Generating

**Solution**: Ensure both receiver and sender names are filled before withdrawal submission.

## Multi-Site Export Feature

The system supports exporting withdrawal data from all 5 sites into a single Excel file with 5 separate sheets:

1. **Summary Sheet**: Overview of all sites with totals
2. **ENAM Sheet**: All withdrawals for ENAM site
3. **MINFOPRA Sheet**: All withdrawals for MINFOPRA site
4. **SUP'PTIC Sheet**: All withdrawals for SUP'PTIC site
5. **ISMP Sheet**: All withdrawals for ISMP site
6. **SDP Sheet**: All withdrawals for SDP site

Each sheet contains:
- Receipt number
- Withdrawal date
- Engineer name
- Receiver and sender names
- Equipment details
- Quantities and units

## Deployment Options

### Option A: Deploy to Vercel (Recommended for Frontend)

```bash
# Push to GitHub
git push origin main

# In Vercel Dashboard:
# 1. Connect GitHub repo
# 2. Select root directory
# 3. Environment variables: Add MONGODB_URI
# 4. Deploy
```

### Option B: Deploy to Railway or Render

Both platforms offer free tier with MongoDB support. See deployment documentation for detailed steps.

## File Structure

```
cimara-inventory/
├── app/
│   ├── api/              # API routes (engineers, equipment, withdrawals, reports)
│   ├── page.tsx          # Main dashboard
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Global styles with CIMARA theme
├── components/
│   ├── header.tsx        # CIMARA header with logo
│   ├── engineer-registration-form.tsx
│   ├── equipment-form.tsx
│   ├── equipment-list.tsx
│   ├── withdrawal-form.tsx
│   ├── withdrawal-history.tsx     # Receipt management
│   ├── reports-view.tsx           # Multi-site export
│   ├── dashboard-stats.tsx
│   └── low-stock-alerts.tsx
├── lib/
│   ├── mongodb.ts        # Database connection
│   ├── db-schemas.ts     # Data models
│   ├── constants.ts      # CIMARA sites and units
│   ├── excel-export.ts   # Multi-site Excel export
│   └── utils.ts          # Utilities
├── public/
│   └── logo.png          # CIMARA logo
└── .env.local            # Environment variables (not in git)
```

## API Endpoints

- **GET/POST `/api/engineers`**: Manage engineer records
- **GET/POST `/api/equipment`**: Manage equipment inventory
- **GET/POST `/api/withdrawals`**: Create and retrieve withdrawals
- **GET `/api/reports`**: Generate daily/weekly reports

## Development

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

### Lint & Format

```bash
npm run lint
```

## Support & Issues

If you encounter issues:

1. Check the Troubleshooting section above
2. Verify MongoDB connection string in `.env.local`
3. Check browser console for error messages
4. Review MongoDB Atlas logs for connection issues

## License

This system is proprietary software for CIMARA Ltd.

## Contact

For support and inquiries, contact CIMARA Ltd., Yaounde, Cameroon.

---

**System Version**: 2.0  
**Last Updated**: January 2026  
**CIMARA Slogan**: "Quality brings reliability"
