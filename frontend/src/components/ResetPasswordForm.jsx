import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import GeneralForm from './GeneralForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ResetPasswordForm() {
    const navigate = useNavigate();
    const { uid, token } = useParams();

    const handleResetPassword = async ({ newPassword, confirmPassword }) => {
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            await api.post('/api/reset_password_confirm/', {
                uid,
                token,
                new_password: newPassword,
            });
            toast("Password reset successfully. You can now log in.");
            navigate('/login');
        } catch (err) {
            const data = err.response?.data;
            if (data?.error) toast.error(data.error);
            else toast.error("An error occurred. Link may be invalid or expired.");
        }
    };

    return (
        <GeneralForm
            mode="reset"
            title="Reset Password"
            onSubmit={handleResetPassword}
            showNewPassword={true}
            showConfirmPassword={true}
            bottomText={
                <h6>
                    Back to <a href="/login">Login</a>
                </h6>
            }
        />
    );
}

export default ResetPasswordForm;
