export const maskEmail = (email: string) => {
  if (!email || !email.includes("@")) return email;
  const [name, domain] = email.split("@");
  const visible = name.slice(0, 2);
  return `${visible}****@${domain}`;
};

export const maskPhone = (phone: string) => {
  if (!phone) return "";
  return phone.slice(0, 2) + "****" + phone.slice(-2);
};

export const isValidPhone = (phone: string): boolean => {
  // Bắt đầu bằng 0, dài 10-11 số, chỉ chứa số
  const regex = /^(0\d{9,10})$/;
  return regex.test(phone);
};

export const validatePassword = (password: string): string => {
  if (!password) return "Vui lòng nhập mật khẩu.";

  if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";

  // if (!/[A-Z]/.test(password)) return "Mật khẩu phải có ít nhất 1 chữ hoa.";

  if (!/[a-z]/.test(password)) return "Mật khẩu phải có ít nhất 1 chữ thường.";

  if (!/[0-9]/.test(password)) return "Mật khẩu phải có ít nhất 1 số.";

  // if (!/[@$!%*?&]/.test(password))
  //   return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt.";

  return ""; // hợp lệ
};
