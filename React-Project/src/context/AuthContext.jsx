import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import axios from "axios";

const AuthContext = createContext();

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


// =========================
// NORMALIZE USER
// =========================

const normalizeUser = (userData) => {
    if (!userData) return null;

    return {
        ...userData,

        // Backend currently uses isAdmin.
        // Frontend admin pages use role.
        role:
            userData.isAdmin === true
                ? "admin"
                : userData.role || "user",
    };
};


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
    // SAVE USER
    // =========================

    const saveUser = (userData) => {

        const normalizedUser =
            normalizeUser(userData);

        setUser(normalizedUser);

        if (normalizedUser) {

            localStorage.setItem(
                "user",
                JSON.stringify(normalizedUser)
            );

        } else {

            localStorage.removeItem("user");

        }

        return normalizedUser;
    };


    // =========================
    // GET CURRENT USER
    // =========================

    const loadUser = async (savedToken) => {

        try {

            const response = await axios.get(
                `${API_URL}/auth/me`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${savedToken}`,
                    },
                }
            );


            if (response.data.success) {

                saveUser(
                    response.data.data
                );

            } else {

                throw new Error(
                    response.data.message ||
                    "Authentication failed"
                );

            }

        } catch (error) {

            console.error(
                "Authentication failed:",
                error
            );


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

                    `${API_URL}/auth/login`,

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


            // =========================
            // NORMALIZE ADMIN USER
            // =========================

            const normalizedUser =
                normalizeUser(
                    loggedInUser
                );


            // =========================
            // SAVE TOKEN
            // =========================

            localStorage.setItem(
                "token",
                newToken
            );


            // =========================
            // SAVE USER
            // =========================

            localStorage.setItem(
                "user",
                JSON.stringify(
                    normalizedUser
                )
            );


            // =========================
            // UPDATE STATE
            // =========================

            setToken(newToken);

            setUser(normalizedUser);


            console.log(
                "Logged in user:",
                normalizedUser
            );


            console.log(
                "Admin:",
                normalizedUser?.role === "admin"
            );


            return {

                success: true,

                user: normalizedUser,

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

                    `${API_URL}/auth/register`,

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


            const normalizedUser =
                normalizeUser(
                    newUser
                );


            // =========================
            // SAVE TOKEN
            // =========================

            localStorage.setItem(
                "token",
                newToken
            );


            localStorage.setItem(
                "user",
                JSON.stringify(
                    normalizedUser
                )
            );


            // =========================
            // UPDATE STATE
            // =========================

            setToken(newToken);

            setUser(normalizedUser);


            return {

                success: true,

                user: normalizedUser,

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