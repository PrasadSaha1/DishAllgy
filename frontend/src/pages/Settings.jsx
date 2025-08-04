import { useNavigate } from 'react-router-dom';
import Base from '../components/Base';
import api from '../api';
import { getUser } from '../components/getUser';
import { useState, useEffect } from 'react';
import "../styles/settings.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DetermineEmail({email}) {
    if (email.includes("@")) {
        return  <a href="/change_email"> <button className="btn btn-primary btn-md mb-3">
            Change Email
            </button> </a>
    } else {
        return  <a href="/add_email"> <button className="btn btn-primary btn-md mb-3">
            Add Email
            </button> </a>
    }
}

export default function Settings() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        getUser().then(user => {
            if (user) {
                setUsername(user.username);
                if (user.email) {
                    setEmail(user.email);
                } else {
                    setEmail("Not Provided");
                }
            } 
        });
    }, []);


  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
        localStorage.clear();
        navigate('/');
    }
  };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("This will permanently delete your account. Are you sure?");
        if (!confirmDelete) return;
        await api.delete('api/delete_account/');
        localStorage.clear();
        navigate('/');

    };

  return (
    <Base>
      <div className="settings-container">
        <h1>Account Settings</h1>
        <h4>Logged in as {username}</h4>
        <h4>Email: {email}</h4>

        <div className="d-flex flex-column align-items-center mt-4">
            <DetermineEmail email={email}/>

            <a href="/change_username"> <button className="btn btn-warning btn-md mb-3">
            Change Username
            </button> </a>

            <a href="/change_password"> <button className="btn btn-success btn-md mb-5">
            Change Password
            </button> </a>
            
            <button onClick={handleLogout} className="btn btn-danger btn-md mb-3">
            Log Out
            </button>

            <button onClick={handleDeleteAccount} className="btn btn-danger btn-md mb-3">
            Delete Account
            </button>
        </div>


      </div>
      <div className="d-flex justify-content-center">
        <a href="/contact_us"> <button className="btn btn-info btn-md mb-3">
          Contact Us
        </button></a>
      </div>
    </Base>
  );
}