import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import GeneralForm from './GeneralForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ChangeEmailForm() {
    const navigate = useNavigate();

    const handleChangeEmailSubmit = async ({ email, password }) => {
        try {
            const res = await api.post(`${import.meta.env.VITE_API_URL}/api/change_email/`, {
                email: email,
                password: password,
            });
            navigate('/settings'); 
            toast.success("Email changed successfully!")
        } catch (err) {
            if (err.status === 401){
                toast.error("Invalid email address");
            } else if (err.status === 400) {
                toast.error("Incorrect password");
            }
        }

    };

    return (
        <GeneralForm
            title="Change Email"
            showEmailFirst={true}
            showPassword={true}
            onSubmit={handleChangeEmailSubmit}
            bottomText={
                <Link className="btn btn-primary" to="/settings">Back</Link>
            }
        />
        
    );
}

export default ChangeEmailForm;
