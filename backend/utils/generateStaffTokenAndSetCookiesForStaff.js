import jwt from "jsonwebtoken";
export const generateStaffTokenAndSetCookiesAndStaff = async (
  res,
  staffId,
  staffRole
) => {
  const token = jwt.sign({ staffId, role: staffRole }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("staffjwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
