import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import axios from "axios";


const AuthContext = createContext();


export const AuthProvider = ({ children }) => {

    // =========================
    // STATE
    // =========================

    const [user, setUser] = useState(null);

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [loading, setLoading] = useState(true);


    // =========================
    // GET CURRENT USER
    // =========================

    const loadUser = async (savedToken) => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/auth/me",
                {
                    headers: {
                        Authorization:
                            `Bearer ${savedToken}`,
                    },
                }
            );


            if (response.data.success) {

                setUser(
                    response.data.data
                );

                // Keep localStorage user updated

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        response.data.data
                    )
                );

            }

        } catch (error) {

            console.error(
                "Authentication failed:",
                error
            );


            // Remove invalid token

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            setToken(null);

            setUser(null);

        } finally {

            setLoading(false);

        }

    };


    // =========================
    // CHECK LOGIN ON APP START
    // =========================

    useEffect(() => {

        const savedToken =
            localStorage.getItem("token");


        if (savedToken) {

            loadUser(savedToken);

        } else {

            setLoading(false);

        }

    }, []);


    // =========================
    // LOGIN
    // =========================

    const login = async (
        email,
        password
    ) => {

        try {

            const response =
                await axios.post(

                    "http://localhost:5000/api/auth/login",

                    {
                        email,
                        password,
                    }

                );


            if (!response.data.success) {

                return {

                    success: false,

                    message:
                        response.data.message ||
                        "Login failed",

                };

            }


            const {

                token: newToken,

                user: loggedInUser,

            } = response.data.data;


            // Save token

            localStorage.setItem(
                "token",
                newToken
            );


            // Save user

            localStorage.setItem(
                "user",
                JSON.stringify(
                    loggedInUser
                )
            );


            // Update state

            setToken(newToken);

            setUser(loggedInUser);


            return {

                success: true,

                user: loggedInUser,

                token: newToken,

            };

        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            return {

                success: false,

                message:
                    error.response?.data
                        ?.message ||

                    error.message ||

                    "Login failed",

            };

        }

    };


    // =========================
    // REGISTER
    // =========================

    const register = async (
        name,
        email,
        password
    ) => {

        try {

            const response =
                await axios.post(

                    "http://localhost:5000/api/auth/register",

                    {
                        name,
                        email,
                        password,
                    }

                );


            if (!response.data.success) {

                return {

                    success: false,

                    message:
                        response.data.message ||
                        "Registration failed",

                };

            }


            const {

                token: newToken,

                user: newUser,

            } = response.data.data;


            // Save token

            localStorage.setItem(
                "token",
                newToken
            );


            // Save user

            localStorage.setItem(
                "user",
                JSON.stringify(
                    newUser
                )
            );


            // Update state

            setToken(newToken);

            setUser(newUser);


            return {

                success: true,

                user: newUser,

                token: newToken,

            };

        } catch (error) {

            console.error(
                "Register error:",
                error
            );


            return {

                success: false,

                message:
                    error.response?.data
                        ?.message ||

                    error.message ||

                    "Registration failed",

            };

        }

    };


    // =========================
    // LOGOUT
    // =========================

    const logout = () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );


        setToken(null);

        setUser(null);

    };


    // =========================
    // CONTEXT PROVIDER
    // =========================

    return (

        <AuthContext.Provider
            value={{
                user,
                token,
                loading,

                login,
                register,
                logout,
            }}
        >

            {children}

        </AuthContext.Provider>

    );

};


// =========================
// CUSTOM HOOK
// =========================

export const useAuth = () => {

    return useContext(
        AuthContext
    );

};