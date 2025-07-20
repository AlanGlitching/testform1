import { useState } from 'react';
import styles from './Share.module.css';

interface ShareProps {
  onBack?: () => void;
}

const Share: React.FC<ShareProps> = ({ onBack }) => {
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');
  const [instagramInstructions, setInstagramInstructions] = useState(false);
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
      setShareError('');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setShareError('Failed to copy link. Please try again or copy manually.');
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setShareError('');
        setTimeout(() => setCopied(false), 3000);
      } catch (fallbackErr) {
        setShareError('Copy failed. Please copy the URL manually.');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleShare = async (platform: string) => {
    setShareError('');
    setInstagramInstructions(false);
    
    if (platform === 'instagram') {
      // Instagram doesn't support direct URL sharing, so we'll copy the link and show instructions
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
        setCopied(true);
        setInstagramInstructions(true);
        setTimeout(() => {
          setCopied(false);
          setInstagramInstructions(false);
        }, 5000);
      } catch (err) {
        console.error('Failed to copy for Instagram: ', err);
        setShareError('Failed to copy link for Instagram. Please copy manually.');
      }
      return;
    }
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`,
      email: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n\n' + shareData.url)}`
    };

    const url = urls[platform as keyof typeof urls];
    if (url) {
      try {
        const popup = window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
        if (!popup) {
          setShareError('Popup blocked. Please allow popups for this site.');
        }
      } catch (err) {
        console.error('Error opening share window:', err);
        setShareError('Failed to open share window. Please try again.');
      }
    }
  };

  const handleNativeShare = async () => {
    setShareError('');
    setInstagramInstructions(false);
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error sharing:', err);
          setShareError('Native sharing failed. Please use the social media buttons below.');
        }
      }
    } else {
      setShareError('Native sharing is not supported in your browser. Please use the social media buttons below.');
    }
  };

  return (
    <div className={styles.share}>
      <div className={styles.header}>
        <h1>📤 Share</h1>
        <button className={styles.backButton} onClick={onBack}>
          ⏰ Back to Clock
        </button>
      </div>
      
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
            
            {shareError && (
              <div className={styles.errorMessage}>
                ⚠️ {shareError}
              </div>
            )}

            {instagramInstructions && (
              <div className={styles.instagramInstructions}>
                📋 <strong>Instagram Instructions:</strong>
                <br />
                1. Open Instagram app
                <br />
                2. Create a new post or story
                <br />
                3. Paste the copied text in your caption
                <br />
                4. Share your post! ✨
              </div>
            )}
            
            <div className={styles.socialButtons}>
              <button 
                onClick={() => handleShare('twitter')}
                className={`${styles.socialButton} ${styles.twitter}`}
                title="Share on Twitter/X"
              >
                <span className={styles.icon}>𝕏</span>
                Twitter
              </button>
              
              <button 
                onClick={() => handleShare('facebook')}
                className={`${styles.socialButton} ${styles.facebook}`}
                title="Share on Facebook"
              >
                <span className={styles.icon}>f</span>
                Facebook
              </button>
              
              <button 
                onClick={() => handleShare('instagram')}
                className={`${styles.socialButton} ${styles.instagram}`}
                title="Copy link for Instagram"
              >
                <span className={styles.icon}>📷</span>
                Instagram
              </button>
              
              <button 
                onClick={() => handleShare('linkedin')}
                className={`${styles.socialButton} ${styles.linkedin}`}
                title="Share on LinkedIn"
              >
                <span className={styles.icon}>in</span>
                LinkedIn
              </button>
              
              <button 
                onClick={() => handleShare('whatsapp')}
                className={`${styles.socialButton} ${styles.whatsapp}`}
                title="Share on WhatsApp"
              >
                <span className={styles.icon}>📱</span>
                WhatsApp
              </button>
              
              <button 
                onClick={() => handleShare('email')}
                className={`${styles.socialButton} ${styles.email}`}
                title="Share via Email"
              >
                <span className={styles.icon}>✉️</span>
                Email
              </button>
            </div>

            <div className={styles.nativeShare}>
              <button 
                onClick={handleNativeShare}
                className={styles.nativeShareButton}
                title="Use native sharing (if available)"
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
                  title="Click to select all text"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button 
                  onClick={handleCopyLink}
                  className={styles.copyButton}
                  title="Copy link to clipboard"
                >
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.backButton} onClick={onBack}>
            ← Back to Home
          </button>
          <button className={styles.contactButton} onClick={onBack}>
            📧 Contact Creators
          </button>
        </div>
      </main>
    </div>
  );
}

export default Share; 