# CIMARA Inventory Management System - Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure MongoDB
Create `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017/cimara_inventory
MONGODB_DB=cimara_inventory
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=cimara_inventory
```

### Step 3: Run Application
```bash
npm run dev
```

Visit: `http://localhost:3000`

## First Use Workflow

### 1. Register an Engineer (5 minutes)
1. Click **Engineers** tab
2. Fill in the form:
   - Full Name: John Doe
   - Email: john@cimara.cm
   - Phone: +237 6XX XXX XXX
   - Site Name: Yaounde Central Office
   - Employee ID: EMP-001
   - Department: Operations
3. Click **Register Engineer**

### 2. Add Equipment (5 minutes)
1. Click **Equipment** tab
2. Click **Equipment Form**
3. Add items:
   - Name: Power Drill
   - Category: Power Tools
   - Serial: SN-001
   - Quantity: 10
   - Unit: Pieces
   - Location: Warehouse A, Shelf 1
4. Click **Add Equipment**
5. Repeat for more items

### 3. Record Equipment Withdrawal (3 minutes)
1. Click **Withdrawals** tab
2. Select Engineer: John Doe
3. Set Date: Today
4. Add Items:
   - Select equipment
   - Enter quantity
   - Click **Add Item**
5. Click **Record Withdrawal**

### 4. View Receipt (2 minutes)
1. Click **Receipts** tab
2. Find the withdrawal in the list
3. Click **View Receipt**
4. Click **Print Receipt** to download

### 5. Generate Report (3 minutes)
1. Click **Reports** tab
2. Select Report Type: Daily
3. Choose Site: Yaounde Central Office
4. Set Date: Today
5. Click **Generate Report**
6. Export:
   - Click **Export to Excel** OR
   - Click **Export to PDF** OR
   - Click **Export to Word**

## Key Features

### Dashboard
- View real-time statistics
- See low stock alerts
- Monitor total equipment and engineers

### Engineer Management
- Register new engineers
- Assign to sites
- Track all team members

### Equipment Inventory
- Add equipment with specifications
- Monitor quantities in real-time
- Track equipment condition
- View storage locations

### Withdrawals
- Record multi-item withdrawals
- Generate professional receipts
- Print withdrawal documents
- Track complete history

### Reports
- Generate daily/weekly reports
- Filter by site and date range
- Export to multiple formats
- View detailed usage statistics

## Navigation

| Tab | Purpose |
|-----|---------|
| Dashboard | View statistics and alerts |
| Engineers | Register and manage engineers |
| Equipment | Add and view inventory |
| Withdrawals | Record equipment withdrawals |
| Receipts | View and print withdrawal receipts |
| Reports | Generate and export reports |

## Common Tasks

### Check Equipment Quantity
1. Go to **Equipment** tab
2. Look at the "Quantity" column in the table
3. Items with <5 units appear in **Dashboard** alerts

### Print a Receipt
1. Go to **Receipts** tab
2. Find the withdrawal date
3. Click **View Receipt**
4. Click **Print Receipt**
5. Your browser print dialog opens

### Export Weekly Report
1. Go to **Reports** tab
2. Select **Weekly** report type
3. Choose a site
4. Set start and end dates
5. Click **Generate Report**
6. Click **Export to Excel/PDF/Word**

### Find Low Stock Items
1. Go to **Dashboard** tab
2. Scroll to **Low Stock Alerts** section
3. See all items below minimum quantity

## Color Guide

| Color | Meaning |
|-------|---------|
| Purple | Primary brand color / Important |
| Yellow | Secondary accent / Warning |
| Green | Good condition / Safe |
| Yellow | Fair condition / Caution |
| Red | Critical / Needs attention |
| Blue | Category / Classification |

## Data Entry Tips

### Engineer Registration
- Use official employee IDs
- Include complete contact information
- Assign engineers to their primary site

### Equipment Entry
- Use clear, descriptive names
- Include serial numbers when available
- Specify correct units (pieces, meters, liters, etc.)
- Update location when items move

### Withdrawal Recording
- Select correct engineer
- Double-check quantities
- Include notes for unusual withdrawals
- Save receipts for records

## Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env.local
```

### Form Won't Submit
- Check all required fields (marked with *)
- Verify numeric values are numbers
- Ensure site name matches registered sites

### Export Not Working
- Check browser download settings
- Disable pop-up blockers
- Ensure sufficient disk space
- Try different export format

### Low Quantities Not Showing
- Go to Equipment tab
- Verify quantity is less than 5
- Refresh the page (F5)
- Check Dashboard alerts

## Best Practices

### Daily Operations
1. Start with Dashboard to check alerts
2. Process equipment withdrawals
3. Print receipts for records
4. Update equipment as needed

### Weekly Maintenance
1. Generate weekly report
2. Export and archive reports
3. Check low stock items
4. Update equipment status

### Monthly Review
1. Generate monthly statistics
2. Review engineer activity
3. Plan equipment restocking
4. Audit withdrawal records

## Support Resources

### Documentation
- `README.md` - Full documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `QUICK_START.md` - This guide

### API Reference
See README.md for complete API endpoint documentation

### File Structure
```
app/api/          - API endpoints
components/       - UI components
lib/             - Database and utilities
public/          - Static files (logo)
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Submit Form | Ctrl/Cmd + Enter |
| Print | Ctrl/Cmd + P |
| Refresh | F5 |
| Previous Tab | Shift + Tab |
| Next Tab | Tab |

## Performance Tips

1. Use filters when viewing large datasets
2. Archive old reports regularly
3. Keep MongoDB indexed
4. Clear browser cache periodically
5. Use Chrome/Firefox for best performance

## Contact & Support

For issues or questions:
1. Check README.md for documentation
2. Review IMPLEMENTATION_SUMMARY.md for technical details
3. Check browser console (F12) for errors
4. Contact development team

---

**Quick Start Version**: 1.0
**Last Updated**: January 2026
**CIMARA Ltd., Yaounde**
