import { z } from "zod";
import { addressSchema } from "../User/UserVl.js";

export const createOrderSchema = z.object({
  address: addressSchema,
  couponCode: z.string().optional(),
});