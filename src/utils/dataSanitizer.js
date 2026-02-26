import xss from "xss";

const sanitizedUser = (userData) => {
  return {
    _id: userData._id,
    name: xss(userData.name),
    email: xss(userData.email),
    role: userData.role || "user",
    profileImage: userData.profileImage || null,
    isActive: userData.isActive || true,
    lastLogin: userData.lastLogin || null,
  };
};

export { sanitizedUser };
