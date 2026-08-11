import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import GeneralForm from './GeneralForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LogInForm() {
    const navigate = useNavigate();

    const handleLogin = async ({ username, password }) => {
        try {
            const res = await api.post(`${import.meta.env.VITE_API_URL}/api/token/`, { username, password });
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            toast.success("Successfuly logged in!")
            navigate('/');
        } catch (err) {
            const data = err.response?.data;
            if (data?.detail) toast.error("Incorrect username or password");
            else toast.error("An unknown error occurred");
        }
    };

    return (
        <GeneralForm
            mode="login"
            title="Login"
            showUsername={true}
            showPassword={true}
            onSubmit={handleLogin}
            bottomText={
                <>
                    <h6>
                        Don't have an account? Click <Link to="/register">here</Link> to create one.
                    </h6>
                    <h6 style={{ marginTop: "15px" }}>
                        Forgot your username? Click <Link to="/forgot_username">here</Link>.
                    </h6>
                    <h6 style={{ marginTop: "15px" }}>
                        Forgot your password? Click <Link to="/forgot_password">here</Link>.
                    </h6>
                </>
            }
        />
    );
}

export default LogInForm;
