import api from '../api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import GeneralForm from './GeneralForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ChangeEmailForm() {
    const navigate = useNavigate();

    const handleChangeEmailSubmit = async ({ email, password }) => {
        try {
            const res = await api.post('https://dishallgy-backend.onrender.com/api/change_email/', {
                email: email,
                password: password,
            });
            navigate('/settings'); 
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
                <a className="btn btn-primary" href="/settings">Back</a>
            }
        />
        
    );
}

export default ChangeEmailForm;
