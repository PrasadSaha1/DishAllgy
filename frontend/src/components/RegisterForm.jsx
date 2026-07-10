import api from '../api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import GeneralForm from './GeneralForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RegisterForm() {
    const navigate = useNavigate();

    const handleRegister = async ({ username, password, confirmPassword, email }) => {
       if (username.length < 6) {
            toast.error("Username must be at least 6 characters");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            await api.post("api/user/register/", { username, password, confirmPassword, email });
            const loginRes = await api.post("api/token/", { username, password });
            localStorage.setItem(ACCESS_TOKEN, loginRes.data.access);
            localStorage.setItem(REFRESH_TOKEN, loginRes.data.refresh);
            navigate('/');
        } catch (err) {
            const data = err.response?.data;
            if (data?.username) toast.error(data.username[0]);
            else if (data?.email) toast.error(data.email[0]);
            else if (data?.non_field_errors) toast.error(data.non_field_errors[0]);
            else toast.error("An unknown error occurred");
        }
    };

    return (
        <GeneralForm
            mode="register"
            title="Create Account"
            onSubmit={handleRegister}
            showUsername={true}
            showPassword={true}
            showConfirmPassword={true}
            showEmail={true}
            requireEmail={false}
            bottomText={
                <h6>
                    Already have an account? Click <a href="/login">here</a> to login.
                </h6>
            }
        />
    );
}

export default RegisterForm;
