import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";

// --- Profile Management ---

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true, // Included this to support your new feature
        createdAt: true
      }
    });

    return res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Profile Fetch Failed" });
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { fullName, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { fullName, phone }
    });

    return res.json({
      success: true,
      message: "Profile Updated",
      data: updatedUser
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Profile Update Failed" });
  }
};

// --- Security & Media ---

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Current password incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword }
    });

    return res.json({ success: true, message: "Password Changed Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Password Change Failed" });
  }
};

export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    // Ensure consistency: use .id if your middleware sets req.user.id
    const userId = (req as any).user.id || (req as any).user.userId;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please select an image." });
    }

    const imagePath = `/uploads/profile/${req.file.filename}`;

    await prisma.user.update({
      where: { id: userId },
      data: { profileImage: imagePath }
    });

    return res.json({
      success: true,
      message: "Profile photo uploaded successfully.",
      image: imagePath
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Photo upload failed." });
  }
};
export const removeProfilePhoto = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    await prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: null,
      },
    });

    return res.json({
      success: true,
      message: "Profile photo removed successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove profile photo",
    });
  }
};