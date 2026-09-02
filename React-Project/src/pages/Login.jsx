import { useState } from "react";

import {
    useNavigate,
    Link,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "../styles/login.css";


function Login() {

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const { login } = useAuth();

    const navigate = useNavigate();


    // =========================
    // LOGIN
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        setLoading(true);


        const result =
            await login(
                email,
                password
            );


        setLoading(false);


        if (!result.success) {

            setError(
                result.message
            );

            return;

        }


        // =========================
        // ADMIN
        // =========================

        if (
            result.user.role === "admin"
        ) {

            navigate("/admin");

            return;

        }


        // =========================
        // CUSTOMER
        // =========================

        navigate("/");

    };


    return (

        <section className="login-page">

            <div className="login-box">

                <h1>
                    Welcome Back 👋
                </h1>


                <p>
                    Login to Spice House
                </p>


                {/* ERROR */}

                {error && (

                    <div className="login-error">

                        {error}

                    </div>

                )}


                {/* FORM */}

                <form
                    onSubmit={
                        handleSubmit
                    }
                >

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(
                                e.target.value
                            )
                        }
                        required
                    />


                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }
                        required
                    />


                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"}

                    </button>

                </form>


                <p>

                    Don't have an account?{" "}

                    <Link to="/register">

                        Register

                    </Link>

                </p>

            </div>

        </section>

    );

}


export default Login;