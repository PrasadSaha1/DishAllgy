import api from '../api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import GeneralForm from './GeneralForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ChangePasswordForm() {
    const navigate = useNavigate();

    const handleChangePasswordSubmit = async ({ password, newPassword, confirmPassword }) => {
        try {
            console.log(password, newPassword, confirmPassword);
            const res = await api.post('http://localhost:8000/api/change_password/', {
                old_password: password,
                new_password: newPassword,
                confirm_password: confirmPassword,  
            });
            navigate('/settings'); 
        } catch (err) {
            if (err.status === 401){
                toast.error("Invalid current password");
            } else if (err.status === 409) {
                toast.error("Passwords do not match");
            } else if (err.status === 400) {
                toast.error("New password must be at least 8 characters long");
            }
        }

    };

    return (
        <GeneralForm
            title="Change Password"
            showPassword={true}
            showNewPassword={true}
            showConfirmPassword={true}
            passwordDescription={"Current Password"}
            onSubmit={handleChangePasswordSubmit}
            bottomText={
                <a className="btn btn-primary" href="/settings">Back</a>
            }
        />
    );
}

export default ChangePasswordForm;
