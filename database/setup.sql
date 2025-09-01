-- College Bus Booking System Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seat_number INTEGER NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  college_reg_no TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  sport TEXT NOT NULL CHECK (sport IN ('cricket', 'volleyball', 'basketball', 'football', 'faculty', '8ballpool')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_seat_number ON bookings(seat_number);
CREATE INDEX IF NOT EXISTS idx_bookings_sport ON bookings(sport);
CREATE INDEX IF NOT EXISTS idx_bookings_gender ON bookings(gender);
CREATE INDEX IF NOT EXISTS idx_bookings_college_reg_no ON bookings(college_reg_no);
-- (removed) user_id index

-- Enable Row Level Security (optional but recommended)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Simplified demo policies: allow all operations
DROP POLICY IF EXISTS "Allow read to all" ON bookings;
DROP POLICY IF EXISTS "Allow insert for self" ON bookings;
DROP POLICY IF EXISTS "Allow modify own booking" ON bookings;
DROP POLICY IF EXISTS "Allow delete own booking" ON bookings;
DROP POLICY IF EXISTS "Allow all operations" ON bookings;
CREATE POLICY "Allow all operations" ON bookings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create a function to check team limits
CREATE OR REPLACE FUNCTION check_team_limits()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_limit INTEGER;
BEGIN
  -- Get current count for the team
  SELECT COUNT(*) INTO current_count
  FROM bookings
  WHERE sport = NEW.sport 
    AND gender = NEW.gender
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000');
  
  -- Set max limits based on sport and gender
  CASE 
    WHEN NEW.sport = 'cricket' AND NEW.gender = 'male' THEN max_limit := 14;
    WHEN NEW.sport = 'volleyball' AND NEW.gender = 'male' THEN max_limit := 11;
    WHEN NEW.sport = 'volleyball' AND NEW.gender = 'female' THEN max_limit := 12;
    WHEN NEW.sport = 'basketball' AND NEW.gender = 'male' THEN max_limit := 5;
    WHEN NEW.sport = 'basketball' AND NEW.gender = 'female' THEN max_limit := 7;
    WHEN NEW.sport = 'football' AND NEW.gender = 'male' THEN max_limit := 7;
    WHEN NEW.sport = '8ballpool' THEN max_limit := 1;
    WHEN NEW.sport = 'faculty' THEN max_limit := 3;
    ELSE max_limit := 0;
  END CASE;
  
  -- Check if limit would be exceeded
  IF current_count >= max_limit THEN
    RAISE EXCEPTION 'Team limit exceeded for % % (max: %, current: %)', 
      NEW.sport, NEW.gender, max_limit, current_count;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce team limits
DROP TRIGGER IF EXISTS enforce_team_limits ON bookings;
CREATE TRIGGER enforce_team_limits
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_team_limits();

-- Create a function to validate seat numbers
CREATE OR REPLACE FUNCTION validate_seat_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if seat number is within valid range (1-55)
  IF NEW.seat_number < 1 OR NEW.seat_number > 55 THEN
    RAISE EXCEPTION 'Seat number must be between 1 and 55';
  END IF;
  
  -- Check if seat is already booked (for INSERT)
  IF TG_OP = 'INSERT' THEN
    IF EXISTS (SELECT 1 FROM bookings WHERE seat_number = NEW.seat_number) THEN
      RAISE EXCEPTION 'Seat % is already booked', NEW.seat_number;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- (removed) unique constraint on user_id

-- Create trigger to validate seat numbers
DROP TRIGGER IF EXISTS validate_seat_number_trigger ON bookings;
CREATE TRIGGER validate_seat_number_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION validate_seat_number();

-- Create a view for team statistics
CREATE OR REPLACE VIEW team_statistics AS
SELECT 
  sport,
  gender,
  COUNT(*) as current_count,
  CASE 
    WHEN sport = 'cricket' AND gender = 'male' THEN 14
    WHEN sport = 'volleyball' AND gender = 'male' THEN 11
    WHEN sport = 'volleyball' AND gender = 'female' THEN 12
    WHEN sport = 'basketball' AND gender = 'male' THEN 5
    WHEN sport = 'basketball' AND gender = 'female' THEN 7
    WHEN sport = 'football' AND gender = 'male' THEN 7
    WHEN sport = '8ballpool' THEN 1
    WHEN sport = 'faculty' THEN 3
    ELSE 0
  END as max_limit
FROM bookings
GROUP BY sport, gender
ORDER BY sport, gender;

-- Create a view for overall statistics
CREATE OR REPLACE VIEW overall_statistics AS
SELECT 
  COUNT(*) as total_bookings,
  55 - COUNT(*) as available_seats,
  COUNT(CASE WHEN gender = 'male' THEN 1 END) as male_bookings,
  COUNT(CASE WHEN gender = 'female' THEN 1 END) as female_bookings,
  COUNT(CASE WHEN sport = 'faculty' THEN 1 END) as faculty_bookings
FROM bookings;

-- Insert some sample data (optional - for testing)
-- Uncomment the lines below if you want to add sample bookings

/*
INSERT INTO bookings (seat_number, student_name, college_reg_no, gender, sport) VALUES
(5, 'John Smith', 'CS2024001', 'male', 'cricket'),
(6, 'Sarah Johnson', 'CS2024002', 'female', 'volleyball'),
(7, 'Mike Wilson', 'CS2024003', 'male', 'basketball'),
(8, 'Emily Davis', 'CS2024004', 'female', 'basketball'),
(9, 'David Brown', 'CS2024005', 'male', 'football'),
(10, 'Dr. Robert Miller', 'FAC001', 'male', 'faculty');
*/

-- Grant necessary permissions
GRANT ALL ON bookings TO authenticated;
GRANT ALL ON bookings TO anon;
GRANT SELECT ON team_statistics TO authenticated;
GRANT SELECT ON team_statistics TO anon;
GRANT SELECT ON overall_statistics TO authenticated;
GRANT SELECT ON overall_statistics TO anon;
