# 🔧 Contact Form Setup Guide

## The Issue
Your contact form is showing a "Network hiccup!" error because it's not connected to a database. The form needs Supabase credentials to store messages.

## Quick Fix Steps

### 1. Create a `.env` file
Create a new file called `.env` in your project root (same folder as `package.json`) with this content:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Get Supabase Credentials
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project" and create a new project
3. Once created, go to **Settings → API** in your dashboard
4. Copy the **Project URL** and **anon/public key**
5. Replace the placeholder values in your `.env` file

### 3. Create the Database Table
1. In your Supabase dashboard, go to **SQL Editor**
2. Run this SQL command:

```sql
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow public users to insert contacts
CREATE POLICY "Allow public insert" ON contacts
  FOR INSERT WITH CHECK (true);
```

### 4. Restart Your App
1. Stop your development server (Ctrl+C)
2. Run `npm run dev` again
3. Test the contact form

## Alternative: Use a Different Contact Method
If you don't want to set up Supabase, you can:
- Replace the contact form with a link to your email
- Use a service like Formspree or Netlify Forms
- Add social media links

## Need Help?
- Check the full `SUPABASE_SETUP.md` file for detailed instructions
- Make sure your `.env` file is in the project root
- Verify your Supabase credentials are correct
- Check the browser console for any error messages 