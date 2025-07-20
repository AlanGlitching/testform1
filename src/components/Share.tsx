import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Share.module.css';

function Share() {
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.origin;

  const shareData = {
    title: 'World Clock - A Beautiful React Application',
    text: 'Check out this amazing World Clock application built with React! Real-time clock with timezone selection.',
    url: currentUrl
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleShare = async (platform: string) => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
      instagram: `https://www.instagram.com/?url=${encodeURIComponent(shareData.url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`,
      email: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n\n' + shareData.url)}`
    };

    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className={styles.share}>
      <header className={styles.header}>
        <h1>Share This Masterpiece</h1>
        <p>Help others discover this amazing World Clock application!</p>
      </header>
      
      <main className={styles.main}>
        <div className={styles.shareCard}>
          <div className={styles.preview}>
            <h2>World Clock</h2>
            <p>A React 18 + Vite application showing real-time clock with timezone selection</p>
            <div className={styles.features}>
              <span>🌍 Multiple Timezones</span>
              <span>⚡ Real-time Updates</span>
              <span>🎨 Beautiful Design</span>
            </div>
          </div>

          <div className={styles.shareOptions}>
            <h3>Share via:</h3>
            
            <div className={styles.socialButtons}>
              <button 
                onClick={() => handleShare('twitter')}
                className={`${styles.socialButton} ${styles.twitter}`}
              >
                <span className={styles.icon}>𝕏</span>
                Twitter
              </button>
              
              <button 
                onClick={() => handleShare('facebook')}
                className={`${styles.socialButton} ${styles.facebook}`}
              >
                <span className={styles.icon}>f</span>
                Facebook
              </button>
              
              <button 
                onClick={() => handleShare('instagram')}
                className={`${styles.socialButton} ${styles.instagram}`}
              >
                <span className={styles.icon}>📷</span>
                Instagram
              </button>
              
              <button 
                onClick={() => handleShare('linkedin')}
                className={`${styles.socialButton} ${styles.linkedin}`}
              >
                <span className={styles.icon}>in</span>
                LinkedIn
              </button>
              
              <button 
                onClick={() => handleShare('whatsapp')}
                className={`${styles.socialButton} ${styles.whatsapp}`}
              >
                <span className={styles.icon}>📱</span>
                WhatsApp
              </button>
              
              <button 
                onClick={() => handleShare('email')}
                className={`${styles.socialButton} ${styles.email}`}
              >
                <span className={styles.icon}>✉️</span>
                Email
              </button>
            </div>

            <div className={styles.nativeShare}>
              <button 
                onClick={handleNativeShare}
                className={styles.nativeShareButton}
              >
                📤 Share (Native)
              </button>
            </div>

            <div className={styles.copyLink}>
              <h3>Or copy the link:</h3>
              <div className={styles.linkContainer}>
                <input 
                  type="text" 
                  value={currentUrl} 
                  readOnly 
                  className={styles.linkInput}
                />
                <button 
                  onClick={handleCopyLink}
                  className={styles.copyButton}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/" className={styles.backButton}>
            ← Back to Home
          </Link>
          <Link to="/contact" className={styles.contactButton}>
            Contact Creators
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Share; 