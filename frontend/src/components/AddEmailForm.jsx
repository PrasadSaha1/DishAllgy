import api from '../api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import GeneralForm from './GeneralForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function AddEmailForm() {
    const navigate = useNavigate();

    const handleAddEmailSubmit = async ({ email }) => {
        try {
            const res = await api.post('http://localhost:8000/api/add_email/', {
                email: email
            });
            navigate('/settings'); 
        } catch (err) {
            if (err.status === 401){
                toast.error("Invalid email address");
            } 
        }

    };

    return (
        <GeneralForm
            title="Add Email"
            showEmail={true}
            onSubmit={handleAddEmailSubmit}
            bottomText={
                <a className="btn btn-primary" href="/settings">Back</a>
            }
        />
    );
}

export default AddEmailForm;
