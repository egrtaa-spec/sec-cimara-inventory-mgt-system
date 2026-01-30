# CIMARA Inventory Management System - Maintenance Guide

## System Health Checks

### Daily Checks (5 minutes)
```bash
# 1. Verify MongoDB connection
mongo "mongodb://localhost:27017/cimara_inventory"

# 2. Check API endpoints
curl http://localhost:3000/api/engineers
curl http://localhost:3000/api/equipment
curl http://localhost:3000/api/withdrawals

# 3. Verify application response
# Visit http://localhost:3000 in browser
```

### Weekly Checks (15 minutes)
1. Review low stock alerts
2. Generate and export weekly report
3. Check error logs
4. Verify all documents printing correctly
5. Test all export formats (PDF, Excel, Word)

### Monthly Checks (1 hour)
1. Full system backup
2. Database optimization
3. Review usage statistics
4. Archive old reports
5. Update documentation
6. Security audit

## Database Maintenance

### Backup Strategy

#### Automated Backup (Recommended)
```bash
# Using MongoDB Atlas
# Enable automatic backups in dashboard
# Set daily snapshots with 30-day retention
```

#### Manual Backup
```bash
# Create backup
mongodump --uri "mongodb://localhost:27017/cimara_inventory" \
          --out ./backups/backup-$(date +%Y%m%d)

# Restore backup
mongorestore --uri "mongodb://localhost:27017/cimara_inventory" \
             ./backups/backup-20260123
```

### Database Optimization

#### Create Indexes
```javascript
// In MongoDB shell
use cimara_inventory;

// Engineers collection
db.engineers.createIndex({ "siteName": 1 });
db.engineers.createIndex({ "email": 1 });

// Equipment collection
db.equipment.createIndex({ "category": 1 });
db.equipment.createIndex({ "quantity": 1 });
db.equipment.createIndex({ "location": 1 });

// Withdrawals collection
db.withdrawals.createIndex({ "withdrawalDate": -1 });
db.withdrawals.createIndex({ "siteName": 1 });
db.withdrawals.createIndex({ "engineerId": 1 });

// Reports collections
db.dailyReports.createIndex({ "reportDate": -1 });
db.weeklyReports.createIndex({ "weekStartDate": -1 });
```

#### Monitor Collection Sizes
```javascript
// Check collection sizes
db.engineers.stats();
db.equipment.stats();
db.withdrawals.stats();
db.inventoryLogs.stats();
```

### Archive Old Data

#### Archive Reports (Monthly)
```javascript
// Archive reports older than 90 days
db.dailyReports.deleteMany({
  "createdAt": { $lt: ISODate("2025-10-24") }
});

db.weeklyReports.deleteMany({
  "createdAt": { $lt: ISODate("2025-10-24") }
});
```

#### Archive Inventory Logs (Quarterly)
```javascript
// Keep last 6 months of logs
db.inventoryLogs.deleteMany({
  "timestamp": { $lt: ISODate("2025-07-23") }
});
```

## Application Maintenance

### Update Dependencies
```bash
# Check for updates
npm outdated

# Update all packages
npm update

# Install latest versions
npm install

# Rebuild
npm run build
```

### Monitor Logs

#### Application Logs
```bash
# In development
npm run dev
# Check console output for errors

# In production
# Configure logging service (Sentry, Datadog, etc.)
```

#### Database Logs
```bash
# MongoDB logs (local)
tail -f /usr/local/var/log/mongodb/mongo.log

# MongoDB Atlas
# Check in dashboard → Logs
```

### Clear Cache
```bash
# Clear Next.js build cache
rm -rf .next

# Rebuild
npm run build
```

## Troubleshooting Guide

### Issue: MongoDB Connection Fails

**Symptoms:**
- "Cannot connect to MongoDB" error
- API endpoints return 500 errors
- Dashboard shows "Error loading data"

**Solutions:**
1. Check MongoDB is running:
   ```bash
   mongosh  # Should connect successfully
   ```

2. Verify connection string:
   ```bash
   # Check .env.local
   echo $MONGODB_URI
   ```

3. Check network connectivity:
   ```bash
   # For local MongoDB
   telnet localhost 27017
   
   # For MongoDB Atlas
   ping cluster.mongodb.net
   ```

4. Check credentials:
   ```bash
   # For Atlas, verify username/password in URI
   # Format: mongodb+srv://username:password@...
   ```

5. Restart MongoDB:
   ```bash
   # macOS
   brew services restart mongodb-community
   
   # Linux
   sudo systemctl restart mongod
   
   # Windows
   net stop MongoDB
   net start MongoDB
   ```

### Issue: Forms Not Submitting

**Symptoms:**
- "Record Withdrawal" button doesn't work
- Form shows validation errors
- No success message appears

**Solutions:**
1. Check browser console (F12) for errors
2. Verify all required fields are filled
3. Check network tab for API calls
4. Verify API endpoint is accessible:
   ```bash
   curl http://localhost:3000/api/withdrawals
   ```
5. Clear browser cache (Ctrl+Shift+Delete)
6. Try different browser

### Issue: Export Not Working

**Symptoms:**
- Export buttons don't work
- Files don't download
- Browser shows blank page

**Solutions:**
1. Check browser download settings
2. Disable pop-up blockers
3. Check console for JavaScript errors
4. Verify required libraries:
   - xlsx (for Excel)
   - jspdf (for PDF)
   - jspdf-autotable (for PDF tables)
5. Test with sample data first

### Issue: Slow Performance

**Symptoms:**
- Pages load slowly
- Reports take long to generate
- Equipment list is sluggish

**Solutions:**
1. Check database indexes:
   ```javascript
   db.collection.getIndexes()
   ```

2. Optimize queries:
   - Add missing indexes
   - Limit result sets
   - Use pagination

3. Clear old data:
   - Archive reports >90 days
   - Clean inventory logs >6 months

4. Check system resources:
   ```bash
   # Check CPU/Memory usage
   top  # macOS/Linux
   Task Manager  # Windows
   ```

5. Increase MongoDB resources

### Issue: Low Stock Alert Not Appearing

**Symptoms:**
- Items with <5 units don't show alert
- Dashboard statistics incorrect

**Solutions:**
1. Verify equipment quantity in database:
   ```javascript
   db.equipment.find({ quantity: { $lt: 5 } })
   ```

2. Check dashboard refreshes:
   - Refresh page (F5)
   - Check console for errors

3. Verify hook is running:
   - Inspect component in React DevTools
   - Check network requests

4. Clear browser cache

### Issue: Receipt Not Printing

**Symptoms:**
- Print dialog doesn't open
- Receipt content missing
- Formatting broken

**Solutions:**
1. Check browser print settings
2. Try different browser
3. Test with print preview
4. Check logo image loads:
   - Verify /public/logo.png exists
   - Check image permissions

5. Test HTML output in browser developer tools

## Performance Optimization

### Database Queries
```javascript
// Instead of loading all, use pagination
db.collection.find({}).limit(20).skip((page-1)*20)

// Use aggregation for reports
db.withdrawals.aggregate([
  { $match: { withdrawalDate: { $gte: startDate } } },
  { $group: { _id: "$siteName", count: { $sum: 1 } } }
])
```

### Frontend Optimization
```typescript
// Use useMemo for expensive calculations
const MemoizedComponent = useMemo(() => <Component />, [deps])

// Lazy load components
const LazyComponent = dynamic(() => import('@/components/Large'))

// Use key prop efficiently
{items.map(item => <Item key={item._id} {...item} />)}
```

### API Optimization
```typescript
// Batch requests when possible
Promise.all([
  fetch('/api/engineers'),
  fetch('/api/equipment'),
  fetch('/api/withdrawals')
])

// Use query filters
/api/withdrawals?siteName=Yaounde&startDate=2026-01-01
```

## Monitoring Checklist

### Weekly
- [ ] Check low stock items
- [ ] Review error logs
- [ ] Test report generation
- [ ] Verify receipt printing
- [ ] Test all export formats
- [ ] Check API response times

### Monthly
- [ ] Backup database
- [ ] Review usage statistics
- [ ] Archive old reports
- [ ] Update documentation
- [ ] Check system resources
- [ ] Review security

### Quarterly
- [ ] Full database maintenance
- [ ] Performance optimization
- [ ] Dependency updates
- [ ] Security audit
- [ ] Disaster recovery test

## Common Maintenance Tasks

### Add Database Index
```javascript
db.equipment.createIndex({ "quantity": 1 })
// Improves low stock queries
```

### Bulk Update Equipment
```javascript
db.equipment.updateMany(
  { category: "power-tools" },
  { $set: { lastMaintenanceDate: ISODate() } }
)
```

### Generate Missing Report
```javascript
// POST to reports endpoint
fetch('/api/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'weekly',
    siteName: 'Yaounde Central Office',
    startDate: '2026-01-16',
    endDate: '2026-01-22'
  })
})
```

### Reset Low Stock Threshold

Edit `/components/dashboard-stats.tsx`:
```typescript
const lowStockItems = equipment.filter((e: any) => e.quantity < 10)  // Change 5 to 10
```

## Disaster Recovery

### Complete System Recovery
1. Restore MongoDB backup:
   ```bash
   mongorestore ./backup-latest
   ```

2. Reinstall dependencies:
   ```bash
   npm install
   ```

3. Rebuild application:
   ```bash
   npm run build
   ```

4. Verify system:
   ```bash
   npm run dev
   # Test all endpoints
   ```

### Data Recovery
1. Locate latest backup
2. Restore specific collection:
   ```bash
   mongorestore --drop --nsInclude "cimara_inventory.withdrawals" ./backup
   ```

3. Verify data integrity
4. Update backup schedule

## Support Contacts

### Technical Support
- MongoDB Support: https://support.mongodb.com
- Next.js Docs: https://nextjs.org/docs
- Node.js Docs: https://nodejs.org/docs

### On-Site Support
- Development Team: [Contact Info]
- Database Administrator: [Contact Info]

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Check dependencies
npm outdated

# Update all dependencies
npm update

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install
```

## Documentation Location

- **README.md** - Main documentation
- **QUICK_START.md** - Getting started guide
- **SYSTEM_OVERVIEW.md** - Architecture details
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation
- **MAINTENANCE.md** - This file

---

**Maintenance Guide Version**: 1.0
**Last Updated**: January 2026
**Maintenance Schedule**: Daily checks, Weekly audits, Monthly optimization
