import User from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ message: 'User not found', success: false });
        }
        return res.json({
            message: 'User data fetched successfully', success: true, userData: {
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        return res.json({ message: error.message, success: false });
    }
}