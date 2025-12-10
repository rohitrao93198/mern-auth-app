import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {

    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(false);

    // ensure axios sends cookies for auth endpoints
    axios.defaults.withCredentials = true;

    const getAuthStatus = async () => {
        try {
            const res = await axios.get(backendURL + '/api/auth/is-auth');
            if (res.data.success) {
                setIsLoggedin(true);
                getUserData();
            }
        } catch (error) {
            // if not authenticated, don't spam the user with a toast on page load
            const status = error?.response?.status;
            if (status === 401) {
                setIsLoggedin(false);
                return;
            }
            toast.error(error?.response?.data?.message || error.message || 'Something went wrong');
        }
    }

    useEffect(() => {
        getAuthStatus();
    }, []);

    const getUserData = async () => {
        try {
            const res = await axios.get(backendURL + '/api/user/data')
            if (res.data.success) {
                setUserData(res.data.userData);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            const status = error?.response?.status;
            if (status === 401) {
                // user is not authenticated; clear state silently
                setIsLoggedin(false);
                setUserData(false);
                return;
            }
            toast.error(error?.response?.data?.message || error.message || 'Something went wrong');
        }
    }
    const value = {
        backendURL,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}