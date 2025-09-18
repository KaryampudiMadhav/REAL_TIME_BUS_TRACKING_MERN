import jwt from "jsonwebtoken";
export const generateTokenAndSetCookies = async (res, userId, userRole) => {
  const token = jwt.sign({ userId, role: userRole }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
