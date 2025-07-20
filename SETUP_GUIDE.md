# Setup Guide for Contact Form and Share Functionality

## Contact Form Setup

The contact form requires Supabase to store submissions. Follow these steps to set it up:

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy your Project URL and anon/public key

### 3. Create Environment File

Create a `.env` file in your project root with:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create the Database Table

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
```

### 5. Test the Contact Form

1. Start your development server: `npm run dev`
2. Navigate to the contact page
3. Fill out and submit the form
4. Check your Supabase dashboard → Table Editor → contacts to see the submission

## Share Functionality

The share functionality is now working with:

- ✅ Social media sharing (Twitter, Facebook, LinkedIn, WhatsApp, Email)
- ✅ Native sharing (when supported by browser)
- ✅ Copy to clipboard with fallback
- ✅ Better error handling and user feedback
- ✅ Improved accessibility with tooltips

## Troubleshooting

### Contact Form Issues

1. **"Contact form is not configured" error**: Make sure your `.env` file exists and contains the correct Supabase credentials
2. **Database errors**: Check that the contacts table exists and RLS policies are set up correctly
3. **Network errors**: Check your internet connection and Supabase project status

### Share Functionality Issues

1. **Copy to clipboard not working**: The app now includes a fallback method for older browsers
2. **Popup blocked**: Allow popups for your site in browser settings
3. **Native sharing not available**: This is normal on desktop browsers - use the social media buttons instead

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