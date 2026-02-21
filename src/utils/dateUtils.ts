/**
 * Format a date string to YYYY-MM-DD format for HTML date input
 */
export const formatDateForInput = (dateString: string | undefined | null): string => {
  if (!dateString) return "";
  
  try {
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
      return dateString.trim();
    }
    
    // Parse ISO date or other formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "";
    }
    
    // Convert to YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

/**
 * Calculate age from date of birth string
 */
export const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  
  try {
    const today = new Date();
    const birthDate = new Date(dob);
    
    if (isNaN(birthDate.getTime())) {
      return 0;
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  } catch {
    return 0;
  }
};
