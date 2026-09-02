import axios from "axios";

/*
|--------------------------------------------------------------------------
| API BASE URL
|--------------------------------------------------------------------------
| Local development:
| VITE_API_URL=http://localhost:5000/api
|
| Production:
| VITE_API_URL=https://your-backend-domain.com/api
|--------------------------------------------------------------------------
*/

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


const API = axios.create({
    baseURL: API_BASE_URL,

    headers: {
        "Content-Type": "application/json",
    },

    timeout: 15000,
});


/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR
|--------------------------------------------------------------------------
| Automatically attaches JWT token to protected requests.
|--------------------------------------------------------------------------
*/

API.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem("token");

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;
    },

    (error) => {

        return Promise.reject(error);

    }
);


/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR
|--------------------------------------------------------------------------
| Handles expired/invalid authentication tokens.
|--------------------------------------------------------------------------
*/

API.interceptors.response.use(

    (response) => {

        return response;

    },

    (error) => {

        if (error.response?.status === 401) {

            const currentPath =
                window.location.pathname;

            /*
            Do not force redirect repeatedly
            if user is already on login/register.
            */

            if (
                currentPath !== "/login" &&
                currentPath !== "/register"
            ) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

            }

        }

        return Promise.reject(error);

    }

);


export default API;