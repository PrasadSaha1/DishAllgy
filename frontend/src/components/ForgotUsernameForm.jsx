import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import GeneralForm from './GeneralForm';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ForgotUsernameForm() {
    const navigate = useNavigate();

    const handleForgotUsernameSubmit = async ({ email }) => {
        try {
            const res = await api.post(`${import.meta.env.VITE_API_URL}/api/forgot_username/`, {
                email: email,
            });
            toast.success("An email has been sent to your address with your username(s).");
        } catch (err) {
            if (err.status === 404){
                toast.error("No account found with this email address.");
            }
        }

    };

    return (
        <GeneralForm
            mode="login"
            title="Retrieve Username"
            onSubmit={handleForgotUsernameSubmit}
            showEmail={true}
            bottomText={
                <>
                    <h6>
                        Remember your username? Log in <Link to="/login">here</Link>.
                    </h6>
                    <h6 style={{ marginTop: "15px" }}>
                        Know your username but forgot your password? Click <Link to="/forgot_password">here</Link> to reset it.
                    </h6>
                </>
            }
        />
    );
}

export default ForgotUsernameForm;
