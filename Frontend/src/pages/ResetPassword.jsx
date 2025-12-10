import React from 'react'
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useContext } from 'react';
import { AppContext } from '../context/AppCOntext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const navigate = useNavigate();

    const { backendURL } = useContext(AppContext);
    axios.defaults.withCredentials = true;

    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isEmailSent, setIsEmailSent] = useState('');
    const [otp, setOtp] = useState(0);
    const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

    const inputRefs = React.useRef([]);

    const handleInput = (e, index) => {
        if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    }

    const handlePaste = (e) => {
        const pasteData = e.clipboardData.getData('Text')
        const pasteArray = pasteData.split('');
        pasteArray.forEach((char, index) => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].value = char;
            }
        });
    }

    const onSubmitEmail = async (e) => {
        try {
            e.preventDefault();
            const res = await axios.post(backendURL + '/api/auth/send-reset-otp', { email });
            if (res.data.success) {
                toast.success(res.data.message);
                setIsEmailSent(true);
            } else {
                toast.error(res.data.message);
            }

        } catch (error) {
            toast.error(error.message);
        }
    }

    const onSubmitOtp = async (e) => {
        e.preventDefault();
        const otpArray = inputRefs.current.map(e => e.value);
        setOtp(otpArray.join(''));
        setIsOtpSubmitted(true);
    }

    const onSubmitNewPassword = async (e) => {
        try {
            e.preventDefault();
            const res = await axios.post(backendURL + '/api/auth/reset-password', { email, otp, newPassword });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/login');
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    return (
        <div className='flex items-center justify-center min-h-screen  bg-linear-to-br from-blue-200 to-purple-400'>
            <img onClick={() => navigate('/')} src={assets.logo} alt="img" className='absolute left-5 sm:left-20 top-5 w-28 cursor-pointer' />

            {/* enter the email id */}
            {
                !isEmailSent && <form onSubmit={onSubmitEmail} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                    <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset password</h1>
                    <p className='text-center mb-6 text-indigo-300'>Enter your registered email address</p>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <img src={assets.mail_icon} alt="img" className='w-3 h-3' />
                        <input
                            type="email"
                            placeholder='Enter email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className='bg-transparent outline-none text-white'
                        />
                    </div>
                    <button className='w-full py-2.5 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3 cursor-pointer'>Submit</button>
                </form>
            }


            {/* otp input form */}
            {
                !isOtpSubmitted && isEmailSent && <form onSubmit={onSubmitOtp} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                    <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password OTP</h1>
                    <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code send to your email</p>
                    <div className='flex justify-between mb-8' onPaste={handlePaste}>
                        {Array(6).fill(0).map((_, index) => (
                            < input
                                type="text"
                                maxLength='1'
                                key={index}
                                required
                                ref={(e) => inputRefs.current[index] = e}
                                onInput={(e) => handleInput(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
                            />
                        ))}
                    </div>
                    <button className='w-full py-2.5 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full cursor-pointer'>Verify email</button>
                </form>
            }


            {/* enter new password */}
            {
                isOtpSubmitted && isEmailSent &&
                <form onSubmit={onSubmitNewPassword} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                    <h1 className='text-white text-2xl font-semibold text-center mb-4'>New password</h1>
                    <p className='text-center mb-6 text-indigo-300'>Enter the new password below</p>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <img src={assets.lock_icon} alt="img" className='w-3 h-3' />
                        <input
                            type="password"
                            placeholder='Enter password'
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className='bg-transparent outline-none text-white'
                        />
                    </div>
                    <button className='w-full py-2.5 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3 cursor-pointer'>Submit</button>
                </form>
            }
        </div>
    )
}

export default ResetPassword;