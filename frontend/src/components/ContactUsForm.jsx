import api from '../api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import GeneralForm from './GeneralForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ContactUsForm() {
    const navigate = useNavigate();

    const handleContactUsSubmit = async ({ email, subject, message }) => {
        try {
            const res = await api.post('https://dishallgy-backend.onrender.com/api/contact_us/', {
                email: email,
                subject: subject,
                message: message
            });
            toast("Message sent!")
        } catch (err) {
            if (err.status === 401){
                toast.error("Invalid email address");
            } 
        } 
    };

    return (
        <GeneralForm
            title="Contact Us"
            showEmail={true}
            showSubject={true}
            showMessage={true}
            onSubmit={handleContactUsSubmit}
            bottomText={
                <a className="btn btn-primary" href="/settings">Back to Settings</a>
            }
        />
    );
}

export default ContactUsForm;
