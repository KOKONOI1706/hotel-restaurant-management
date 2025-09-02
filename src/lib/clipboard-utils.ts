/**
 * Utility function to copy text to clipboard with multiple fallback methods
 * Handles various browser restrictions and security contexts
 */

export const copyToClipboard = async (text: string, successMessage?: string): Promise<boolean> => {
  const defaultMessage = '📋 Đã copy vào clipboard thành công!';
  const message = successMessage || defaultMessage;

  try {
    // Method 1: Modern Clipboard API (preferred)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Method 2: Focus window first, then try clipboard API
    if (navigator.clipboard) {
      // Try to focus the window first
      window.focus();
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Method 3: Legacy execCommand method
    return legacyCopyToClipboard(text);

  } catch (error) {
    console.warn('Clipboard API failed, falling back to legacy method:', error);
    return legacyCopyToClipboard(text);
  }
};

const legacyCopyToClipboard = (text: string): boolean => {
  try {
    // Create temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Style to make it invisible
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    
    // Add to DOM
    document.body.appendChild(textArea);
    
    // Focus and select
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);
    
    // Execute copy command
    const successful = document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textArea);
    
    return successful;
  } catch (error) {
    console.error('Legacy copy method failed:', error);
    return false;
  }
};

/**
 * Copy to clipboard with user feedback
 */
export const copyToClipboardWithAlert = async (
  text: string, 
  successMessage?: string, 
  failureMessage?: string
): Promise<void> => {
  const success = await copyToClipboard(text, successMessage);
  
  if (success) {
    alert(successMessage || '📋 Đã copy vào clipboard thành công!');
  } else {
    const fallbackMessage = failureMessage || 
      '❌ Không thể copy tự động. Bạn có muốn xem nội dung để copy thủ công?';
    
    const userWantsManualCopy = confirm(fallbackMessage);
    if (userWantsManualCopy) {
      // Show content in a prompt for manual copy
      const result = prompt('Copy nội dung sau:', text);
      // User can manually copy from the prompt
    }
  }
};

/**
 * Copy script with specific instructions for auto-fill
 */
export const copyAutoFillScript = async (script: string): Promise<void> => {
  const successMessage = `📋 Script tự động điền đã được copy vào clipboard!

🔧 Hướng dẫn sử dụng:

1️⃣ Vào trang dichvucong.gov.vn/portal/p/home/thong-bao-luu-tru.html

2️⃣ ĐỢI TRANG LOAD HOÀN TOÀN (3-4 giây) ⏳

3️⃣ Mở Developer Console (F12 → Console)

4️⃣ Paste script và nhấn Enter

5️⃣ Script sẽ tự động:
   • Đợi trang load xong (4 giây)
   • Bấm nút "THÊM MỚI NGƯỜI LƯU TRÚ"
   • Điền thông tin khách đầu tiên
   • Hiển thị helper UI để chuyển đổi

💡 LƯU Ý QUAN TRỌNG:
- Phải đợi trang load hoàn toàn trước khi chạy script
- Script có delay tự động để tránh lỗi
- Nếu không tự động được, dùng helper UI thủ công
- Có thể chuyển qua lại giữa các khách

⚠️ Nếu script chạy ngay khi trang vừa load có thể sẽ lỗi!`;

  const failureMessage = `❌ Không thể copy tự động. 
Bạn có muốn xem script để copy thủ công?`;

  await copyToClipboardWithAlert(script, successMessage, failureMessage);
};

/**
 * Copy with retry mechanism
 */
export const copyToClipboardWithRetry = async (
  text: string, 
  maxRetries: number = 3
): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const success = await copyToClipboard(text);
      if (success) return true;
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 200 * (i + 1)));
    } catch (error) {
      console.warn(`Copy attempt ${i + 1} failed:`, error);
    }
  }
  
  return false;
};
