import api from '../api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import GeneralForm from './GeneralForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LogInForm() {
    const navigate = useNavigate();

    const handleLogin = async ({ username, password }) => {
        try {
            const res = await api.post("api/token/", { username, password });
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            toast("Successfuly logged in!")
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
                        Don't have an account? Click <a href="/register">here</a> to create one.
                    </h6>
                    <h6 style={{ marginTop: "15px" }}>
                        Forgot your username? Click <a href="/forgot_username">here</a>.
                    </h6>
                    <h6 style={{ marginTop: "15px" }}>
                        Forgot your password? Click <a href="/forgot_password">here</a>.
                    </h6>
                </>
            }
        />
    );
}

export default LogInForm;
