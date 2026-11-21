import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || "medishare_super_secret_jwt_key_2026";
  return jwt.sign({ id, role }, secret, {
    expiresIn: "1d",
  });
};

export default generateToken;