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


// =========================================================
// GET ADMIN ROLE FROM JWT
// =========================================================

const getRoleFromToken = (token) => {

    try {

        if (!token) {
            return null;
        }

        const parts = token.split(".");

        if (parts.length !== 3) {
            return null;
        }

        const payload =
            JSON.parse(
                atob(
                    parts[1]
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );

        return payload?.role || null;

    } catch (error) {

        console.error(
            "JWT role read error:",
            error
        );

        return null;

    }

};


// =========================================================
// NORMALIZE USER
// =========================================================

const normalizeUser = (
    userData,
    token = null
) => {

    if (!userData) {
        return null;
    }


    const tokenRole =
        getRoleFromToken(token);


    let role = "user";


    // Backend role
    if (
        userData.role === "admin"
    ) {

        role = "admin";

    }

    // Backend isAdmin
    else if (
        userData.isAdmin === true
    ) {

        role = "admin";

    }

    // JWT role
    else if (
        tokenRole === "admin"
    ) {

        role = "admin";

    }

    // Existing role
    else if (
        userData.role
    ) {

        role = userData.role;

    }


    return {

        ...userData,

        role,

        isAdmin:
            role === "admin",

    };

};


// =========================================================
// AUTH PROVIDER
// =========================================================

export const AuthProvider = ({
    children,
}) => {


    // =====================================================
    // STATE
    // =====================================================

    const [
        user,
        setUser,
    ] = useState(null);


    const [
        token,
        setToken,
    ] = useState(
        localStorage.getItem("token")
    );


    const [
        loading,
        setLoading,
    ] = useState(true);


    // =====================================================
    // SAVE USER
    // =====================================================

    const saveUser = (
        userData,
        currentToken = null
    ) => {

        const normalizedUser =
            normalizeUser(
                userData,
                currentToken || token
            );


        setUser(
            normalizedUser
        );


        if (normalizedUser) {

            localStorage.setItem(
                "user",
                JSON.stringify(
                    normalizedUser
                )
            );

        } else {

            localStorage.removeItem(
                "user"
            );

        }


        return normalizedUser;

    };


    // =====================================================
    // LOAD CURRENT USER
    // =====================================================

    const loadUser = async (
        savedToken
    ) => {

        try {

            if (!savedToken) {

                setUser(null);

                setLoading(false);

                return;

            }


            const response =
                await axios.get(
                    `${API_URL}/auth/me`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${savedToken}`,
                        },
                    }
                );


            if (
                response.data?.success
            ) {

                const currentUser =
                    response.data.data;


                const normalizedUser =
                    normalizeUser(
                        currentUser,
                        savedToken
                    );


                setUser(
                    normalizedUser
                );


                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        normalizedUser
                    )
                );


                // =========================================
                // DEBUG
                // =========================================

                console.log(
                    "================================"
                );

                console.log(
                    "CURRENT USER:",
                    normalizedUser
                );

                console.log(
                    "ROLE:",
                    normalizedUser?.role
                );

                console.log(
                    "IS ADMIN:",
                    normalizedUser?.role === "admin"
                );

                console.log(
                    "================================"
                );

            } else {

                throw new Error(
                    response.data?.message ||
                    "Authentication failed"
                );

            }

        } catch (error) {

            console.error(
                "Authentication failed:",
                error?.response?.data ||
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


    // =====================================================
    // CHECK LOGIN WHEN APP STARTS
    // =====================================================

    useEffect(() => {

        const savedToken =
            localStorage.getItem(
                "token"
            );


        if (savedToken) {

            setToken(
                savedToken
            );

            loadUser(
                savedToken
            );

        } else {

            setLoading(false);

        }

    }, []);


    // =====================================================
    // LOGIN
    // =====================================================

    const login = async (
        email,
        password
    ) => {

        try {

            const response =
                await axios.post(
                    `${API_URL}/auth/login`,
                    {
                        email:
                            email.trim(),

                        password,
                    }
                );


            if (
                !response.data?.success
            ) {

                return {

                    success: false,

                    message:
                        response.data?.message ||
                        "Login failed",

                };

            }


            const loginData =
                response.data.data;


            const newToken =
                loginData?.token;


            const loggedInUser =
                loginData?.user;


            if (!newToken) {

                return {

                    success: false,

                    message:
                        "Login token was not received.",

                };

            }


            // =================================================
            // NORMALIZE ADMIN
            // =================================================

            const normalizedUser =
                normalizeUser(
                    loggedInUser,
                    newToken
                );


            // =================================================
            // SAVE TOKEN
            // =================================================

            localStorage.setItem(
                "token",
                newToken
            );


            // =================================================
            // SAVE USER
            // =================================================

            localStorage.setItem(
                "user",
                JSON.stringify(
                    normalizedUser
                )
            );


            // =================================================
            // UPDATE STATE
            // =================================================

            setToken(
                newToken
            );


            setUser(
                normalizedUser
            );


            // =================================================
            // DEBUG
            // =================================================

            console.log(
                "================================"
            );

            console.log(
                "LOGIN SUCCESS"
            );

            console.log(
                "USER:",
                normalizedUser
            );

            console.log(
                "ROLE:",
                normalizedUser?.role
            );

            console.log(
                "IS ADMIN:",
                normalizedUser?.role === "admin"
            );

            console.log(
                "================================"
            );


            return {

                success: true,

                user:
                    normalizedUser,

                token:
                    newToken,

            };

        } catch (error) {

            console.error(
                "Login error:",
                error?.response?.data ||
                error
            );


            return {

                success: false,

                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Login failed",

            };

        }

    };


    // =====================================================
    // REGISTER
    // =====================================================

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
                        name:
                            name.trim(),

                        email:
                            email.trim(),

                        password,
                    }
                );


            if (
                !response.data?.success
            ) {

                return {

                    success: false,

                    message:
                        response.data?.message ||
                        "Registration failed",

                };

            }


            const registerData =
                response.data.data;


            const newToken =
                registerData?.token;


            const newUser =
                registerData?.user;


            const normalizedUser =
                normalizeUser(
                    newUser,
                    newToken
                );


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


            setToken(
                newToken
            );


            setUser(
                normalizedUser
            );


            return {

                success: true,

                user:
                    normalizedUser,

                token:
                    newToken,

            };

        } catch (error) {

            console.error(
                "Register error:",
                error?.response?.data ||
                error
            );


            return {

                success: false,

                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Registration failed",

            };

        }

    };


    // =====================================================
    // LOGOUT
    // =====================================================

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


    // =====================================================
    // PROVIDER
    // =====================================================

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


// =========================================================
// USE AUTH
// =========================================================

export const useAuth = () => {

    return useContext(
        AuthContext
    );

};