import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import GeneralForm from './GeneralForm';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ForgotPasswordForm() {
    const navigate = useNavigate();

    const handleForgotPasswordSubmit = async ({ username }) => {
        try {
            const res = await api.post(`${import.meta.env.VITE_API_URL}/api/forgot_password/`, {
                username: username,
            });
            toast.success("An email has been sent to your address with instructions to reset your password.");
        } catch (err) {
            if (err.status === 404){
                toast.error("No email associated with this username.");
            } else if (err.status === 400) {
                toast.error("Username does not exist");
            }
        }

    };
    return (
        <GeneralForm
            mode="login"
            title="Reset Password"
            onSubmit={handleForgotPasswordSubmit}
            showUsername={true}
            bottomText={
                <>
                    <h6>
                        Remember your password? Log in <Link to="/login">here</Link>.
                    </h6>
                    <h6 style={{ marginTop: "15px" }}>
                        Forgot your username? Click <Link to="/forgot_username">here</Link> to retrieve it.
                    </h6>
                </>
            }
        />
    );
}

export default ForgotPasswordForm;
