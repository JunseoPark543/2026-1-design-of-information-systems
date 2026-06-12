export function normalizePhone(phone: string) {
  return phone.replace(/[^0-9]/g, "");
}

export function buildAuthEmailFromPhone(phone: string) {
  const normalized = normalizePhone(phone);
  return `member-${normalized}@tasteops.local`;
}

export function getSignupDateParts(date = new Date()) {
  return {
    signup_year: date.getFullYear(),
    signup_month: date.getMonth() + 1,
    signup_day: date.getDate(),
  };
}
