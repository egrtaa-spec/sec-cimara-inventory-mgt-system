# CIMARA Inventory Management System - System Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CIMARA IMS Frontend (React)              │
│                                                               │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │   Dashboard  │  Engineers   │  Equipment Management    │ │
│  │   - Stats    │  - Register  │  - Add Items             │ │
│  │   - Alerts   │  - List      │  - View Inventory        │ │
│  │              │  - Update    │  - Track Conditions      │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
│                                                               │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │ Withdrawals  │  Receipts    │  Reports & Export       │ │
│  │ - Record     │  - View      │  - Daily Reports        │ │
│  │ - Track      │  - Print     │  - Weekly Reports       │ │
│  │ - Add items  │  - Download  │  - Export PDF/Excel/Doc │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
                        (REST API)
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                  Next.js API Routes (Backend)                │
│                                                               │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │  /api/       │  /api/       │  /api/                   │ │
│  │  engineers   │  equipment   │  withdrawals             │ │
│  │  GET, POST   │  GET, POST   │  GET, POST               │ │
│  │  PUT, DELETE │  PUT         │  (auto-updates qty)      │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
│                                                               │
│  ┌──────────────┬──────────────┐                            │
│  │  /api/       │  /api/       │                            │
│  │  reports     │  reports     │                            │
│  │  (Generate)  │  (Fetch)     │                            │
│  └──────────────┴──────────────┘                            │
└─────────────────────────────────────────────────────────────┘
                              ↕
                     (MongoDB Queries)
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
│                                                               │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │  engineers   │  equipment   │  withdrawals             │ │
│  │  collection  │  collection  │  collection              │ │
│  │              │              │  (+ inventory logs)      │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
│                                                               │
│  ┌──────────────┬──────────────┐                            │
│  │  daily       │  weekly      │                            │
│  │  Reports     │  Reports     │                            │
│  │  collection  │  collection  │                            │
│  └──────────────┴──────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Equipment Withdrawal Process
```
Engineer Select
      ↓
   [Engineer Form]
      ↓
  Select Site (auto-populated)
      ↓
  [Equipment Selection]
      ↓
  Add Items to Withdrawal
      ↓
  [Submit Withdrawal]
      ↓
  POST /api/withdrawals
      ↓
  ┌─────────────────────┐
  │ Create Withdrawal   │
  │ Record             │
  └─────────────────────┘
      ↓
  ┌─────────────────────┐
  │ Update Equipment    │
  │ Quantities         │
  │ (Auto-reduce)      │
  └─────────────────────┘
      ↓
  ┌─────────────────────┐
  │ Create Inventory    │
  │ Log Entry          │
  │ (Audit Trail)      │
  └─────────────────────┘
      ↓
  [Show Success Message]
      ↓
  [Generate Receipt]
      ↓
  [Display Withdrawal History]
```

### Report Generation Process
```
Select Report Type (Daily/Weekly)
      ↓
  Select Site
      ↓
  Set Date Range
      ↓
  [Generate Report Button]
      ↓
  GET /api/reports?type=...&site=...&dates=...
      ↓
  ┌─────────────────────────┐
  │ Query Withdrawals       │
  │ Collection             │
  └─────────────────────────┘
      ↓
  ┌─────────────────────────┐
  │ Process & Aggregate     │
  │ Data by Equipment       │
  └─────────────────────────┘
      ↓
  ┌─────────────────────────┐
  │ Save Report to DB       │
  │ (Cache Results)         │
  └─────────────────────────┘
      ↓
  [Display Report Data]
      ↓
  [Export Options]
      ├──→ Export to Excel (XLSX)
      ├──→ Export to PDF
      └──→ Export to Word (DOC)
```

## Component Hierarchy

```
RootLayout
├── Header (CIMARA Branding)
│   ├── Logo Image
│   ├── Company Name (CIMARA)
│   ├── Tagline (Quality brings reliability)
│   └── Site Name Display
│
└── Main Tabs Navigation
    ├── Dashboard Tab
    │   ├── DashboardStats
    │   │   ├── Engineers Count Card
    │   │   ├── Equipment Count Card
    │   │   ├── Withdrawals Count Card
    │   │   └── Low Stock Count Card
    │   └── LowStockAlerts
    │       └── Alert List
    │
    ├── Engineers Tab
    │   └── EngineerRegistrationForm
    │       ├── Text Inputs
    │       ├── Validation
    │       └── Submit Handler
    │
    ├── Equipment Tab
    │   ├── EquipmentForm
    │   │   ├── Text Inputs
    │   │   ├── Select Dropdowns
    │   │   └── Submit Handler
    │   └── EquipmentList
    │       └── Data Table
    │
    ├── Withdrawals Tab
    │   └── WithdrawalForm
    │       ├── Engineer Selector
    │       ├── Equipment Selector
    │       ├── Quantity Input
    │       ├── Item List
    │       └── Submit Handler
    │
    ├── Receipts Tab
    │   └── WithdrawalHistory
    │       ├── History Table
    │       └── Receipt Dialog
    │           └── Receipt Display (Printable)
    │
    └── Reports Tab
        └── ReportsView
            ├── Report Type Selector
            ├── Date Range Picker
            ├── Report List
            └── Export Buttons
                ├── Excel Export
                ├── PDF Export
                └── Word Export

    Toaster (Global Notifications)
```

## Database Collections Schema

### engineers
```json
{
  "_id": ObjectId,
  "name": "Engineer Name",
  "email": "email@example.com",
  "phone": "+237 6XX XXX XXX",
  "siteName": "Yaounde Central Office",
  "employeeId": "EMP-001",
  "department": "Operations",
  "createdAt": 2026-01-23,
  "updatedAt": 2026-01-23
}
```

### equipment
```json
{
  "_id": ObjectId,
  "name": "Power Drill",
  "description": "Heavy-duty power drill",
  "category": "power-tools",
  "serialNumber": "SN-001",
  "quantity": 10,
  "unit": "pieces",
  "location": "Warehouse A, Shelf 1",
  "condition": "good",
  "lastMaintenanceDate": null,
  "createdAt": 2026-01-23,
  "updatedAt": 2026-01-23
}
```

### withdrawals
```json
{
  "_id": ObjectId,
  "withdrawalDate": 2026-01-23,
  "engineerId": "engineer_id",
  "engineerName": "John Doe",
  "siteName": "Yaounde Central Office",
  "items": [
    {
      "equipmentId": "equipment_id",
      "equipmentName": "Power Drill",
      "quantityWithdrawn": 2,
      "unit": "pieces"
    }
  ],
  "notes": "For project XYZ",
  "status": "completed",
  "createdAt": 2026-01-23,
  "updatedAt": 2026-01-23
}
```

### inventoryLogs
```json
{
  "_id": ObjectId,
  "equipmentId": "equipment_id",
  "equipmentName": "Power Drill",
  "previousQuantity": 10,
  "newQuantity": 8,
  "change": -2,
  "type": "withdrawal",
  "withdrawalId": "withdrawal_id",
  "performedBy": "John Doe",
  "timestamp": 2026-01-23T10:30:00Z
}
```

## API Endpoint Map

```
GET  /api/engineers           → Fetch all engineers
POST /api/engineers           → Register new engineer
GET  /api/engineers/[id]      → Get specific engineer
PUT  /api/engineers/[id]      → Update engineer
DELETE /api/engineers/[id]    → Delete engineer

GET  /api/equipment           → Fetch all equipment
POST /api/equipment           → Add equipment
PUT  /api/equipment           → Update equipment

GET  /api/withdrawals         → Get withdrawals (with filters)
POST /api/withdrawals         → Create withdrawal

GET  /api/reports             → Fetch reports
POST /api/reports             → Generate report
```

## User Roles & Permissions

### Current Implementation (Single User)
- Full access to all features
- No authentication required
- All operations allowed

### Future Enhancement: Role-Based Access
```
┌──────────────────────────────────────────────────┐
│              User Roles                          │
├──────────────────────────────────────────────────┤
│ Admin                                            │
│ - Manage all users                               │
│ - View all reports                               │
│ - Delete transactions                            │
│ - System configuration                           │
├──────────────────────────────────────────────────┤
│ Manager/Supervisor                               │
│ - Register engineers                             │
│ - Add equipment                                  │
│ - View/Approve withdrawals                       │
│ - Generate reports                               │
│ - Export data                                    │
├──────────────────────────────────────────────────┤
│ Engineer/Field Staff                             │
│ - View available equipment                       │
│ - Request withdrawals                            │
│ - View own receipts                              │
│ - Limited reporting                              │
└──────────────────────────────────────────────────┘
```

## Branding Implementation

### Colors
```
Primary (Purple): #7B2CBF
  - Main buttons
  - Header background
  - Highlights
  - Sidebar

Secondary (Yellow): #FFD60A
  - Accents
  - Alerts
  - Hover states
  - Badges

Neutral Colors:
  - Background: #FAFAFA
  - Cards: #FFFFFF
  - Text: #1A1A1A
  - Muted: #808080
```

### Typography
```
Heading Font: Geist
Body Font: Geist
Monospace: Geist Mono

Font Sizes:
- H1: 2.5rem (40px)
- H2: 2rem (32px)
- H3: 1.5rem (24px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)
```

### Logo & Branding
```
Location: /public/logo.png
Display:
- Header (60x60px)
- Receipts (50x50px)
- Reports (header section)
- Favicon
```

## Security Features

### Data Protection
- MongoDB connection pooling
- Query parameterization (prevent injection)
- Input validation on all forms
- Error handling without data leakage

### Access Control
- Environment variable protection
- Server-side operations for sensitive data
- Client-side validation + Server validation

### Audit Trail
- Inventory logs for all changes
- Withdrawal records with engineer attribution
- Timestamp on all operations

## Performance Optimizations

### Frontend
- Component memoization
- Lazy loading for tables
- Efficient state management
- CSS classes (no inline styles)

### Backend
- Database connection pooling
- Indexed collections
- Efficient aggregation pipelines
- Caching strategies

### Network
- Minimal API calls
- Batch operations where possible
- Gzip compression
- Asset optimization

## Scalability Considerations

### Current Capacity
- Supports small-to-medium teams (50-500 engineers)
- Unlimited equipment items
- Thousands of transactions

### Future Scaling
- Database replication
- Read replicas for reports
- API rate limiting
- Caching layer (Redis)
- Load balancing for API

---

**System Version**: 1.0
**Last Updated**: January 2026
**Architecture Type**: MERN Stack (MongoDB, Express via Next.js, React, Node.js)
