import { BadRequestError, NotFoundError } from "../errors/ApiError";
import { IUser } from "../interfaces/IUser";
import { UserModel } from "../models/user";

import bcrypt from "bcrypt";

// Create a new user
export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
  const { name, email, password, role } = userData;

  // Check if email is already in use
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new BadRequestError("Email already in use");
  }

  try {
    const newUser = new UserModel({
      name,
      email,
      password,
      role,
    });
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashedPassword;
    return await newUser.save();
  } catch (error) {
    throw error;
  }
};

// Update user password by user id
export const updateUserPassword = async (
  id: string,
  currentPassword: string,
  newPassword: string
): Promise<IUser> => {
  try {
    const user = await UserModel.findById(id);
    // Check if user exist
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if the new password is provided and not empty
    if (
      !newPassword ||
      newPassword.trim() === "" ||
      !currentPassword ||
      currentPassword.trim() === ""
    ) {
      throw new BadRequestError("Please provide current and new passwords");
    }

    // Verify if the current password matches the user's stored password
    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordMatch) {
      throw new BadRequestError("Current password is incorrect");
    }

    // Hash the new password and update it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    return await user.save();
  } catch (error) {
    throw error;
  }
};

// Find user by id
export const findUserById = async (id: string): Promise<IUser> => {
  try {
    if (!id) {
      throw new NotFoundError("Invalid User ID");
    }
    const user = await UserModel.findById(id).populate("events");
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

// Find user by email
export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

// Fetch all users (with paginations)
export const fetchAllUsers = async (
  page: number,
  limit: number
): Promise<{ users: IUser[]; total: number }> => {
  try {
    const skip = (page - 1) * limit;
    // Apply pagination using skip and limit
    const users = await UserModel.find().skip(skip).limit(limit);
    // Get total number of users for pagination info
    const total = await UserModel.countDocuments();
    return { users, total };
  } catch (error) {
    throw error;
  }
};

// Update user by id
export const updateUser = async (
  id: string,
  updatedData: Partial<IUser>
): Promise<IUser> => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

// Delete a user by ID
export const deleteUser = async (id: string): Promise<void> => {
  try {
    const user = await UserModel.findByIdAndDelete(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }
  } catch (error) {
    throw error;
  }
};

export default {
  createUser,
  updateUserPassword,
  findUserById,
  findUserByEmail,
  fetchAllUsers,
  updateUser,
  deleteUser,
};
