# Supabase Setup Guide

This guide will help you set up Supabase to store contact form submissions.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy your Project URL and anon/public key
3. Create a `.env` file in your project root with:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Create the Database Table

1. In your Supabase dashboard, go to SQL Editor
2. Run the following SQL to create the contacts table:

```sql
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows inserting new contacts
CREATE POLICY "Allow public insert" ON contacts
  FOR INSERT WITH CHECK (true);

-- Optional: Create a policy to allow reading contacts (for admin purposes)
-- CREATE POLICY "Allow authenticated read" ON contacts
--   FOR SELECT USING (auth.role() = 'authenticated');
```

## 4. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the contact page
3. Fill out and submit the form
4. Check your Supabase dashboard → Table Editor → contacts to see the submission

## 5. Optional: Set up Email Notifications

You can set up database triggers to send email notifications when new contacts are submitted:

1. Go to Database → Functions in your Supabase dashboard
2. Create a new function or use the built-in email service
3. Set up a trigger on the contacts table

## Security Notes

- The current setup uses the anon key which is safe for client-side use
- Row Level Security (RLS) is enabled to control access
- Only INSERT operations are allowed for public users
- Consider adding rate limiting for production use

## Environment Variables

Make sure your `.env` file is in the project root and contains:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Never commit your `.env` file to version control. Add it to your `.gitignore` file. 