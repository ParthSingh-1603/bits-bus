# SRM Bus Booking System by Parth Singh

A modern web application for booking bus seats for SRM college sports teams. This system allows students and faculty to book seats on a 56-seater bus with specific allocations for different sports teams.

## Features

- **56-Seater Bus Layout**: Visual representation of bus seats with interactive booking (K row has 6 seats)
- **Gender-Based Booking**: Separate tracking for male and female students with pink seats for females
- **Sports Team Allocations**:
  - Cricket (Male): 12 seats
  - Volleyball (Male): 7 seats
  - Volleyball (Female): 12 seats
  - Basketball (Male): 5 seats
  - Basketball (Female): 7 seats
  - Football (Male): 7 seats
  - Faculty: 3 seats
- **SRM College Registration Validation**: Validates student registration numbers
- **Real-time Statistics**: Live updates of seat availability and team allocations
- **Supabase Database**: Secure and scalable backend storage
- **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd srm-bus-booking-system
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project dashboard
3. Navigate to SQL Editor
4. Run the following SQL to create the bookings table:

```sql
-- Create bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seat_number INTEGER NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  college_reg_no TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  sport TEXT NOT NULL CHECK (sport IN ('cricket', 'volleyball', 'basketball', 'football', 'faculty')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_seat_number ON bookings(seat_number);
CREATE INDEX idx_bookings_sport ON bookings(sport);
CREATE INDEX idx_bookings_gender ON bookings(gender);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo purposes)
CREATE POLICY "Allow all operations" ON bookings FOR ALL USING (true);
```

### 4. Configure Environment Variables

1. Copy the example environment file:
```bash
cp env.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under "API".

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### For SRM Students/Faculty

1. **View Bus Layout**: The main page shows the 56-seater bus layout with color-coded seats (K row has 6 seats)
2. **Select a Seat**: Click on any available (gray) seat to book it
3. **Fill Booking Form**: 
   - Enter your full name
   - Enter your SRM college registration number (8-20 characters, letters and numbers)
   - Select your gender
   - Choose your sport team
4. **Confirm Booking**: Click "Confirm Booking" to reserve your seat

### Seat Color Legend

- **Gray**: Available seats
- **Blue**: Male students
- **Pink**: Female students  
- **Green**: Currently selected seat
- **Dark Gray**: Driver area (not bookable)

### Team Allocations

The system automatically tracks team allocations and prevents overbooking:

- **Cricket (Male)**: Maximum 13 students
- **Volleyball (Male)**: Maximum 7 students
- **Volleyball (Female)**: Maximum 12 students
- **Basketball (Male)**: Maximum 5 students
- **Basketball (Female)**: Maximum 7 students
- **Football (Male)**: Maximum 7 students
- **Faculty**: Maximum 3 members

## Database Schema

### Bookings Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| seat_number | INTEGER | Seat number (1-56) |
| student_name | TEXT | Full name of student/faculty |
| college_reg_no | TEXT | SRM College registration number |
| gender | TEXT | 'male' or 'female' |
| sport | TEXT | Sport team or 'faculty' |
| created_at | TIMESTAMP | Booking timestamp |

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:

```bash
npm run build
npm start
```

## Customization

### Adding New Sports Teams

1. Update the sport types in `lib/supabase.ts`
2. Modify the team limits in `components/BookingForm.tsx`
3. Update the statistics calculation in `app/page.tsx`

### Changing Bus Layout

Modify the `rows` array in `components/BusLayout.tsx` to change the seat arrangement.

### Styling

The application uses Tailwind CSS. Custom colors and styles can be modified in:
- `tailwind.config.js` for theme customization
- `app/globals.css` for custom CSS classes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Note**: This is a demo application. For production use, consider adding:
- User authentication
- Admin panel for managing bookings
- Email notifications
- Payment integration
- More robust validation
- Rate limiting
- Backup and recovery procedures
