import React from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onCopy?: (success: boolean) => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'Copy',
  variant = 'primary',
  size = 'md',
  className = '',
  onCopy
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      let success = false;

      // Method 1: Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          success = true;
        } catch (e) {
          console.warn('Clipboard API failed:', e);
        }
      }

      // Method 2: Legacy fallback
      if (!success) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, text.length);
        
        try {
          success = document.execCommand('copy');
        } catch (e) {
          console.warn('execCommand failed:', e);
        } finally {
          document.body.removeChild(textArea);
        }
      }

      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }

      onCopy?.(success);
      return success;
    } catch (error) {
      console.error('Copy operation failed:', error);
      onCopy?.(false);
      return false;
    }
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`
        inline-flex items-center gap-2 font-medium rounded-md
        transition-all duration-200 ease-in-out
        ${copied ? 'bg-green-600 text-white' : variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
        ${copied ? 'scale-105' : 'hover:scale-105'}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
      `}
      disabled={copied}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
};

// Specialized Auto-fill Copy Button
interface AutoFillCopyButtonProps {
  script: string;
  guestCount: number;
  onCopy?: (success: boolean) => void;
  className?: string;
}

export const AutoFillCopyButton: React.FC<AutoFillCopyButtonProps> = ({
  script,
  guestCount,
  onCopy,
  className = ''
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      let success = false;

      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(script);
          success = true;
        } catch (e) {
          console.warn('Clipboard API failed:', e);
        }
      }

      // Fallback method
      if (!success) {
        const textArea = document.createElement('textarea');
        textArea.value = script;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          success = document.execCommand('copy');
        } finally {
          document.body.removeChild(textArea);
        }
      }

      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        
        // Show success message with instructions
        const message = `📋 Script tự động điền đã được copy!\n\n🔧 Hướng dẫn sử dụng:\n1. Mở Developer Console (F12) trên trang dichvucong.gov.vn\n2. Paste script và nhấn Enter\n3. Script sẽ tự động bấm "THÊM MỚI NGƯỜI LƯU TRÚ"\n4. Điền thông tin ${guestCount} khách với giao diện trợ lý`;
        alert(message);
      } else {
        // Fallback: show manual copy prompt
        const confirmed = confirm('❌ Không thể copy tự động. Bạn có muốn xem script để copy thủ công?');
        if (confirmed) {
          prompt('Copy script này:', script);
        }
      }

      onCopy?.(success);
    } catch (error) {
      console.error('Copy operation failed:', error);
      onCopy?.(false);
      
      // Final fallback
      const confirmed = confirm('❌ Có lỗi xảy ra. Bạn có muốn xem script để copy thủ công?');
      if (confirmed) {
        prompt('Copy script này:', script);
      }
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-2 px-4 py-2 font-medium rounded-md
        transition-all duration-200 ease-in-out
        ${copied 
          ? 'bg-green-600 text-white scale-105' 
          : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
        }
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${className}
      `}
      disabled={copied}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Script đã copy!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Script Tự Động Điền ({guestCount} khách)
        </>
      )}
    </button>
  );
};
