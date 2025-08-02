import { useState } from 'react';
import { supabase } from '../lib/supabase';
import styles from './Contact.module.css';

interface ContactProps {
  onBack?: () => void;
}

const Contact: React.FC<ContactProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters except + for country code
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // If it starts with +, keep it for international numbers
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // For US numbers, format as (XXX) XXX-XXXX
    if (cleaned.length <= 10) {
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        const parts = [match[1], match[2], match[3]].filter(Boolean);
        if (parts.length === 0) return '';
        if (parts.length === 1) return `(${parts[0]}`;
        if (parts.length === 2) return `(${parts[0]}) ${parts[1]}`;
        return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
      }
    }
    
    return cleaned;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    
    // Remove formatting characters
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Check for international format (starts with +)
    if (cleaned.startsWith('+')) {
      // International numbers should be 7-15 digits after +
      return /^\+\d{7,15}$/.test(cleaned);
    }
    
    // US numbers should be exactly 10 digits
    return /^\d{10}$/.test(cleaned);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
      
      // Validate phone number
      if (formatted && !validatePhoneNumber(formatted)) {
        setPhoneError('Please enter a valid phone number 📞');
      } else {
        setPhoneError('');
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Validate phone number before submission
    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      setSubmitStatus('error');
      setErrorMessage('Please enter a valid phone number! 📞');
      setIsSubmitting(false);
      return;
    }

    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setSubmitStatus('error');
      setErrorMessage('😁 Network hiccup! Check your connection and try again! 🌐');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Attempting to insert data:', formData);
      
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }
      
      const { data, error } = await supabase
        .from('contacts')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            comment: formData.comment || null,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        setSubmitStatus('error');
        setErrorMessage(error.message || 'Something went wrong! Give it another shot! 🎯');
        throw error;
      }

      console.log('Contact form submitted successfully:', data);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', comment: '' });
      setPhoneError('');
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      if (!errorMessage) {
        setErrorMessage('Network hiccup! Check your connection and try again! 🌐');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contact}>
      <div className={styles.header}>
        <h1>💬 Say Hi!</h1>
        <p className={styles.subtitle}>Let's chat about your awesome project ideas! 🚀</p>
        <button className={styles.backButton} onClick={onBack}>
          ⏰ Back to Clock
        </button>
      </div>
      
      <main className={styles.main}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {submitStatus === 'success' && (
            <div className={styles.successMessage}>
              🎉 Woohoo! Thanks for reaching out! I'll get back to you super soon! ✨
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className={styles.errorMessage}>
              😅 {errorMessage || 'Oops! Something went wrong. No worries, try again!'}
              <br />
              <small>If it keeps acting up, just shoot me a message on social media! 📱</small>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="name">What should I call you? *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Your awesome name here ✨"
              disabled={isSubmitting}
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Where can I reach you? *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="your.email@example.com 📧"
              disabled={isSubmitting}
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone number (totally optional!)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(555) 123-4567 or +1 555 123 4567 📞"
              disabled={isSubmitting}
              maxLength={20}
            />
            {phoneError && (
              <div className={styles.fieldError}>
                {phoneError}
              </div>
            )}
            <small className={styles.helpText}>
              💡 For US numbers: (555) 123-4567 | For international: +1 555 123 4567
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="comment">What's on your mind? 💭</label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Tell me about your project, ask questions, or just say hello! ✨"
              disabled={isSubmitting}
              rows={4}
              maxLength={1000}
              className={styles.textarea}
            />
            <small className={styles.helpText}>
              💡 Share your ideas, questions, or just drop a friendly message! (max 1000 characters)
            </small>
          </div>

          <div className={styles.formActions}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting || !!phoneError}
            >
              {isSubmitting ? '📤 Sending your message...' : '📤 Send it! 🚀'}
            </button>
            <button 
              type="button"
              className={styles.backButton}
              onClick={onBack}
            >
              🏠 Back to Home
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Contact; 