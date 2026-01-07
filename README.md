# Yoga Institute Student Management Dashboard

A comprehensive web-based dashboard application for managing yoga institute students, batches, and payment tracking with receipt management.

## Features

- **Student Management**: Add, edit, delete, and view detailed student information
- **Batch Management**: Organize students into batches with timing and weekly schedules
- **Payment Tracking**: Track payment status (Paid/Unpaid) for each student
- **Receipt Management**: Track receipt status (Received/Pending) for each payment
- **Monthly Reset**: Automated monthly payment and receipt status reset on the 1st of every month
- **Overdue Reminders**: Send automatic reminders to students with overdue payments
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Collapsible Sidebar**: Easy navigation with floating sidebar menu

## Tech Stack

- **Frontend**: React + JavaScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Backend**: Supabase Edge Functions
- **Icons**: Lucide React
- **Hosting**: Vercel-ready

## Database Schema

### Tables

1. **batches**
   - id (uuid)
   - name (text)
   - timing (text)
   - weekly_days (text[])
   - created_at, updated_at (timestamptz)

2. **students**
   - id (uuid)
   - batch_id (uuid, foreign key)
   - name (text)
   - whatsapp_number (text)
   - admission_date (date)
   - due_date (integer, 1-31)
   - fees_amount (numeric)
   - payment_status (text: 'paid' or 'unpaid')
   - receipt_provided (boolean: true or false, resets monthly)
   - payment_bank (text)
   - last_payment_date (timestamptz)
   - created_at, updated_at (timestamptz)
   - recipt_status (bool)

3. **payment_history**
   - id (uuid)
   - student_id (uuid, foreign key)
   - payment_date (timestamptz)
   - amount (numeric)
   - status (text)
   - created_at (timestamptz)

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (database already configured)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already configured in `.env` file:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Key Functionalities

### Student Management
- View all students in a selected batch
- Add new students with complete details
- Edit existing student information
- Delete students (with confirmation)
- Click on student name to view full details

### Batch Management
- Create batches with name, timing, and weekly schedule
- Edit batch information
- Delete batches
- View batch details including student count

### Payment Processing
1. When "Mark Paid" button is clicked:
   - Payment status updates to "Paid"
   - Payment recorded in payment history
   - Student can then provide receipt

2. When "Receipt" button is clicked:
   - Receipt status updates to "Received"
   - Payment cycle is marked complete

3. Monthly Automation:
   - All payment statuses reset to "Unpaid" on 1st of each month
   - All receipt statuses reset to "Pending" on 1st of each month

### Receipt Management

The dashboard includes receipt tracking with two statuses:
- **Received**: Receipt has been provided by the student
- **Pending**: Receipt is awaiting submission

Workflow:
1. Student makes payment → Payment Status = "Paid"
2. Student provides receipt → Receipt Status = "Received"
3. Next month (1st) → Both statuses reset automatically



## Future Enhancements

- Email notifications for payment reminders
- SMS notifications as backup
- Payment gateway integration
- Bulk payment processing
- Attendance tracking system
- Detailed reports and analytics
- Student performance tracking
- Export data to Excel/PDF
- WhatsApp message integration (optional)

## Automation Setup with Cron Jobs

### 1. Monthly Payment & Receipt Reset (1st of every month)

Set up a cron job to automatically reset payment and receipt statuses:

**Using Supabase Integrated Cron service:**
1. Set schedule: `0 0 1 * *` (runs at midnight on the 1st of every month)
2. Method: POST
3. Update the students Table at Midnight on the 1st of every month

**What gets reset:**
- All payment statuses reset to "Unpaid"
- All receipt statuses reset to "Pending"


### Manual Triggers

Functions can also be triggered manually:
- **Monthly Reset**: Contact your system administrator or use backend access

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
