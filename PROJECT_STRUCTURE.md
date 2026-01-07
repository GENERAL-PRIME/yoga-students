# Yoga Institute Management - Project Structure

## Complete File Structure

```
yoga-institute-management/
├── src/
│   ├── components/
│   │   ├── Header.jsx              # Top navigation header with institute branding
│   │   ├── Sidebar.jsx             # Collapsible sidebar navigation
│   │   ├── StudentDashboard.jsx    # Main student management interface
│   │   ├── StudentModal.jsx        # Add/Edit student modal
│   │   ├── BatchManagement.jsx     # Batch CRUD interface
│   │   └── BatchInfoCard.jsx       # Batch details card
│   ├── lib/
│   │   └── supabase.js             # Supabase client configuration
│   ├── App.jsx                     # Main application component
│   ├── main.jsx                    # Application entry point
│   └── index.css                   # Global styles with Tailwind
├── supabase/
│   ├── migrations/
│   │   └── 20251012160953_create_yoga_institute_schema.sql
│   └── functions/
│       ├── send-whatsapp/
│       │   └── index.ts            # WhatsApp notification Edge Function
│       ├── send-overdue-reminders/
│       │   └── index.ts            # Overdue payment reminder Edge Function
│       └── monthly-payment-reset/
│           └── index.ts            # Monthly payment reset Edge Function
├── public/                         # Static assets
├── dist/                          # Production build output
├── .env                           # Environment variables (Supabase config)
├── .gitignore                     # Git ignore file
├── index.html                     # HTML entry point
├── package.json                   # Dependencies and scripts
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── eslint.config.js               # ESLint configuration
├── README.md                      # Main documentation
└── PROJECT_STRUCTURE.md           # This file
```

## Component Hierarchy

```
App.jsx
├── Header.jsx
├── Sidebar.jsx
└── [Current Page]
    ├── StudentDashboard.jsx
    │   ├── StudentModal.jsx
    │   └── BatchInfoCard.jsx
    └── BatchManagement.jsx
```

## Data Flow

1. **Supabase Client** (`src/lib/supabase.js`)
   - Configured with environment variables
   - Provides database access throughout the app

2. **Components** fetch data from Supabase and manage local state:
   - `StudentDashboard.jsx`: Manages students, batches, and payment processing
   - `BatchManagement.jsx`: Handles batch CRUD operations
   - Modals: Handle form submissions and updates

3. **Edge Functions** handle server-side operations:
   - `send-whatsapp`: Sends WhatsApp notifications
   - `monthly-payment-reset`: Resets payment statuses monthly

## Key Features by File

### src/components/Header.jsx
- Green gradient header
- Institute branding
- Mobile menu toggle

### src/components/Sidebar.jsx
- Responsive sidebar (desktop/mobile)
- Navigation menu
- Page routing

### src/components/StudentDashboard.jsx
- Batch selection dropdown
- Student table with payment status
- Payment processing with WhatsApp integration
- Student CRUD operations
- Batch info display
- "Send Reminders" button for overdue payments
- Automatic reminder functionality with confirmation

### src/components/StudentModal.jsx
- Add/Edit student form
- Admission date → Due date auto-calculation
- Validation
- Full student details display

### src/components/BatchManagement.jsx
- Batch cards grid layout
- Add/Edit/Delete batches
- Weekly schedule selector
- Batch timing management

### src/components/BatchInfoCard.jsx
- Batch details modal
- Student count
- Schedule information

## Database Schema

### Tables
1. **batches**: Store batch information
2. **students**: Store student details and payment info
3. **payment_history**: Track all payment transactions

### Key Relationships
- students.batch_id → batches.id (Many-to-One)
- payment_history.student_id → students.id (Many-to-One)

## Edge Functions

### send-whatsapp
- Endpoint: `/functions/v1/send-whatsapp`
- Method: POST
- Purpose: Send WhatsApp notifications to students
- Currently simulated (ready for real API integration)

### send-overdue-reminders
- Endpoint: `/functions/v1/send-overdue-reminders`
- Method: POST
- Purpose: Send reminders to students with overdue payments
- Calculates days overdue and sends personalized messages
- Can be triggered manually via UI or automatically via cron job

### monthly-payment-reset
- Endpoint: `/functions/v1/monthly-payment-reset`
- Method: POST
- Purpose: Reset payment statuses and send reminders
- Can be triggered via cron job

## Environment Variables

Located in `.env`:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Technology Stack

- **React 18.3.1**: UI framework
- **Vite 5.4.2**: Build tool
- **Tailwind CSS 3.4.1**: Styling
- **Supabase 2.57.4**: Database and backend
- **Lucide React 0.344.0**: Icons

## Color Scheme

- Primary: Green (#059669, #10b981)
- Secondary: Gray shades
- Status: Red (unpaid), Green (paid)
- Accent colors for info cards

## Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Code Conventions

- Components use functional components with hooks
- State management via useState
- Side effects via useEffect
- Async/await for API calls
- Consistent naming: camelCase for variables, PascalCase for components
- Props destructuring in component parameters
