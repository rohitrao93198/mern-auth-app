import React from 'react'
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useContext } from 'react';
import { AppContext } from '../context/AppCOntext';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

const EmailVerify = () => {
    const navigate = useNavigate();

    axios.defaults.withCredentials = true;

    const { backendURL, isLoggedin, userData, getUserData } = useContext(AppContext);

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

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            const otpArray = inputRefs.current.map(e => e.value);
            const otp = otpArray.join('');

            const res = await axios.post(backendURL + '/api/auth/verify-account', { otp });
            if (res.data.success) {
                toast.success(res.data.message);
                getUserData();
                navigate('/');
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        if (isLoggedin && userData.isVerified) {
            navigate('/');
        }
    }, [isLoggedin, userData]);

    return (
        <div className='flex items-center justify-center min-h-screen  bg-linear-to-br from-blue-200 to-purple-400'>
            <img onClick={() => navigate('/')} src={assets.logo} alt="img" className='absolute left-5 sm:left-20 top-5 w-28 cursor-pointer' />
            <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email Verify OTP</h1>
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
                <button className='w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full cursor-pointer'>Verify email</button>
            </form>
        </div>
    )
}

export default EmailVerify;