import UserMd from "./UserMd.js";
import ApiError from "../../Utils/ApiError.js";

export async function getById(userId) {
  const user = await UserMd.findById(userId);
  if (!user) throw ApiError.notFound("کاربر یافت نشد");
  return user;
}

export async function updateProfile(userId, payload) {
  const user = await getById(userId);
  Object.assign(user, payload);
  await user.save();
  return user;
}

export async function setDefaultAddress(userId, address) {
  const user = await getById(userId);
  user.defaultAddress = address;
  await user.save();
  return user;
}

export function findByPhone(phone, withPassword = false) {
  const query = UserMd.findOne({ phone });
  if (withPassword) query.select("+password");
  return query;
}

// برای پنل ادمین
export async function listUsers({ page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    UserMd.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    UserMd.countDocuments(),
  ]);
  return { users, total, page, pages: Math.ceil(total / limit) };
}

export async function toggleBlock(userId) {
  const user = await getById(userId);
  user.isBlocked = !user.isBlocked;
  await user.save();
  return user;
}