# MongoDB Setup - Quick Reference Guide

## What is MongoDB?
MongoDB is a **FREE** NoSQL database perfect for this application. The free M0 tier is unlimited for development.

## Quick Setup (5 Minutes)

### 1. Create Account
- Go to https://www.mongodb.com/cloud/atlas
- Sign up for free
- Verify email

### 2. Create Free Cluster
- Click "Create a Deployment"
- Select **M0 (Free)**
- Choose region closest to you
- Wait 5-10 minutes

### 3. Create User
- Go to "Database Access"
- Click "Add New Database User"
- Username: `cimara_admin`
- Password: Create strong password (save it!)
- Role: "Atlas admin"
- Add User

### 4. Allow Connections
- Go to "Network Access"
- Click "Add IP Address"
- Enter: `0.0.0.0/0` (for development)
- Confirm

### 5. Get Connection String
- Go to "Database" section
- Click "Connect"
- Choose "Drivers"
- Copy the connection string
- Replace PASSWORD with your password
- Replace mydb with `cimara_inventory`

### 6. Add to .env.local
```
MONGODB_URI=mongodb+srv://cimara_admin:PASSWORD@cluster0.mongodb.net/cimara_inventory?retryWrites=true&w=majority
```

### 7. Run Application
```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Common Connection String Issues

| Problem | Solution |
|---------|----------|
| "Connection failed" | Check IP whitelist includes 0.0.0.0/0 |
| "Authentication failed" | Verify username/password in connection string |
| "Cluster not found" | Cluster might be paused - check Atlas dashboard |
| Special chars in password | URL-encode them (e.g., @ becomes %40) |

## Verify Connection Works

If seeing "Failed to register engineers" error:

1. **Check connection string format**:
   ```
   mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE
   ```

2. **Test with MongoDB Shell** (optional):
   ```bash
   npm install -g mongosh
   mongosh "YOUR_CONNECTION_STRING"
   ```

3. **Check MongoDB Atlas**:
   - Cluster should show green checkmark
   - IP 0.0.0.0/0 should be whitelisted
   - User credentials should match

4. **Restart application**:
   ```bash
   npm run dev
   ```

## First-Time Data Entry

After setup works:

1. **Engineers Tab**: Register 2-3 engineers from different sites
2. **Equipment Tab**: Add some equipment (tools, materials, etc.)
3. **Withdrawals Tab**: Create test withdrawal
4. **Reports Tab**: Generate and export a report

## Files That Need MongoDB URI

1. `.env.local` - Must have `MONGODB_URI=...`
2. `/lib/mongodb.ts` - Uses `MONGODB_URI` from environment
3. All API routes in `/app/api/` - Access database through mongodb.ts

## Cleanup & Cost

- **Free Tier**: M0 cluster is completely free forever
- **No Cost**: Free tier won't incur charges even with heavy use
- **Pause**: Can pause cluster to save resources if needed
- **Delete**: Can delete cluster anytime, no impact

## Next Steps

1. Complete setup above
2. Run the application
3. Register engineers
4. Add equipment
5. Create withdrawals
6. Export reports

If you get connection errors, see README.md Troubleshooting section for detailed solutions.

---

**Remember**: The application cannot work without MongoDB! Complete this setup before running the app.
