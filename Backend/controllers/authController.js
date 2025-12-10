import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

// to register a user
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // validate input
        if (!name || !email || !password) {
            return res.json({ message: 'All fields are required', success: false });
        }

        // check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ message: 'User already exists', success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
        });
        await user.save();

        // generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // sending welcome email can be added here
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Our Service',
            text: `Welcome ${name}! Thank you for registering. Your account has been created successfully with email id: ${email}`
        }

        await transporter.sendMail(mailOptions);

        res.json({ message: 'User registered successfully', success: true, user });

    } catch (error) {
        res.json({ message: error.message, success: false });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validate input
        if (!email || !password) {
            return res.json({ message: 'All fields are required', success: false });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: 'Invalid email or password', success: false });
        }

        // check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.json({ message: 'Invalid email or password', success: false });
        }
        // generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.json({ message: 'Login successful', success: true, user, token });

    } catch (error) {
        return res.json({ message: error.message, success: false });
    }
}

export const logout = (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ message: 'Logout successful', success: true });
    } catch (error) {
        return res.json({ message: error.message, success: false });
    }
}

// send OTP for verification to the user's email
export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ message: 'User not found', success: false });
        }

        if (user.isVerified) {
            return res.json({ message: 'Account is already verified', success: false });
        }

        // generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP '
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // OTP valid for 24 hours

        await user.save();

        // send OTP email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            // text: `Your OTP for account verification is: ${otp}. It is valid for 24 hours.`,
            html: EMAIL_VERIFY_TEMPLATE.replace('{{otp}}', otp).replace('{{email}}', user.email)
        }
        await transporter.sendMail(mailOptions);

        return res.json({ message: 'Verification OTP sent to email', success: true });
    } catch (error) {
        return res.json({ message: error.message, success: false });
    }
}

// verify OTP and activate user account
export const verifyEmail = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        if (!userId || !otp) {
            return res.json({ message: 'User ID and OTP are required', success: false });
        }

        // find user
        const user = await User.findById(userId);
        // check if user exists
        if (!user) {
            return res.json({ message: 'User not found', success: false });
        }

        // to check the otp is valid or match to the user
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ message: 'Invalid OTP', success: false });
        }

        // check if OTP is expired
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ message: 'OTP has expired', success: false });
        }
        // verify user
        user.isVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({ message: 'Email verified successfully', success: true });

    } catch (error) {
        return res.json({ message: error.message, success: false });
    }
}

// check if user is authenticated
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ message: 'User is authenticated', success: true });
    } catch (error) {
        return res.json({ message: error.message, success: false });
    }
}

// send password reset otp
export const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.json({ message: 'Email is required', success: false });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: 'User not found', success: false });
        }

        // generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP '
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

        await user.save();

        // send OTP email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            // text: `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`,
            html: PASSWORD_RESET_TEMPLATE.replace('{{otp}}', otp).replace('{{email}}', user.email)
        }
        await transporter.sendMail(mailOptions);

        return res.json({ message: 'Password reset OTP sent to email', success: true });
    } catch (error) {
        return res.json({ message: error.message, success: false });
    }
}

// reset password using otp
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.json({ message: 'Email, OTP and new password are required', success: false });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: 'User not found', success: false });
        }

        // to check the otp is valid or match to the user
        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({ message: 'Invalid OTP', success: false });
        }

        // check if OTP is expired
        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ message: 'OTP has expired', success: false });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // update password
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({ message: 'Password reset successful', success: true });
    } catch (error) {
        return res.json({ message: error.message, success: false });
    }
}