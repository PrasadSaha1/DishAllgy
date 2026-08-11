import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import GeneralForm from './GeneralForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ChangeUsernameForm() {
    const navigate = useNavigate();

    const handleChangeUsernameSubmit = async ({ username, password }) => {
        try {
            const res = await api.post(`${import.meta.env.VITE_API_URL}/api/change_username/`, {
                username: username,
                password: password,
            });
            navigate('/settings'); 
            toast.success("Username changed successfully!")
        } catch (err) {
            if (err.status === 401){
                toast.error("Invalid password");
            } else if (err.status === 409) {
                toast.error("Username already taken");
            } else if (err.status === 400) {
                toast.error("Username must be at least 8 characters long");
            }
        }

    };

    return (
        <GeneralForm
            title="Change Username"
            showUsername={true}
            showPassword={true}
            usernameDescription={"New Username"}
            onSubmit={handleChangeUsernameSubmit}
            bottomText={
                <Link className="btn btn-primary" to="/settings">Back</Link>
            }
        />
    );
}

export default ChangeUsernameForm;
