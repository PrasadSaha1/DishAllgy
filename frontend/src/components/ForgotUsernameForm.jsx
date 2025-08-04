import api from '../api';
import { useNavigate } from 'react-router-dom';
import GeneralForm from './GeneralForm';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ForgotUsernameForm() {
    const navigate = useNavigate();

    const handleForgotUsernameSubmit = async ({ email }) => {
        try {
            const res = await api.post('http://localhost:8000/api/forgot_username/', {
                email: email,
            });
            toast.error("An email has been sent to your address with your username(s).");
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
                        Remember your username? Log in <a href="/login">here</a>.
                    </h6>
                    <h6 style={{ marginTop: "15px" }}>
                        Know your username but forgot your password? Click <a href="/forgot_password">here</a> to reset it.
                    </h6>
                </>
            }
        />
    );
}

export default ForgotUsernameForm;
