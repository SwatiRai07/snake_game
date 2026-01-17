

exports.generateOTP = () => {
  // 4 digit OTP (1000 - 9999)
  return Math.floor(1000 + Math.random() * 9000).toString();
};
