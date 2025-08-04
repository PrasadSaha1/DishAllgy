import api from '../api';
import { useNavigate } from 'react-router-dom';
import GeneralForm from './GeneralForm';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ForgotPasswordForm() {
    const navigate = useNavigate();

    const handleForgotPasswordSubmit = async ({ username }) => {
        try {
            const res = await api.post('http://localhost:8000/api/forgot_password/', {
                username: username,
            });
            toast("An email has been sent to your address with instructions to reset your password.");
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
                        Remember your password? Log in <a href="/login">here</a>.
                    </h6>
                    <h6 style={{ marginTop: "15px" }}>
                        Forgot your username? Click <a href="/forgot_username">here</a> to retrieve it.
                    </h6>
                </>
            }
        />
    );
}

export default ForgotPasswordForm;
