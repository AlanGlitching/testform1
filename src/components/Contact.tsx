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
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setSubmitStatus('error');
      setErrorMessage('Oops! The contact form isn\'t set up yet. Drop me a DM instead! 😊');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Attempting to insert data:', formData);
      
      const { data, error } = await supabase
        .from('contacts')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
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
      setFormData({ name: '', email: '', phone: '' });
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
              placeholder="Your digits if you prefer calls 📞"
              disabled={isSubmitting}
              pattern="[\+]?[0-9\s\-\(\)]{10,}"
            />
          </div>

          <div className={styles.formActions}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
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