import { Link, useNavigate } from 'react-router-dom';
import Base from '../components/Base';
import api from '../api';
import { getUser } from '../components/getUser';
import { useState, useEffect } from 'react';
import "../styles/Settings.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DetermineEmail({email}) {
    if (email.includes("@")) {
        return  <Link to="/change_email"> <button className="btn btn-primary btn-md mb-3">
            Change Email
            </button> </Link>
    } else {
        return  <Link to="/add_email"> <button className="btn btn-primary btn-md mb-3">
            Add Email
            </button> </Link>
    }
}

export default function Settings() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUser().then(user => {
            if (user) {
                setUsername(user.username);
                if (user.email) {
                    setEmail(user.email);
                } else {
                    setEmail("Not Provided");
                }
                setLoading(false);
            } 
        });
        document.title = "Settings";
    }, []);


  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
        localStorage.clear();
        navigate('/');
        toast.success("Logged out successfully!")
    }
  };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("This will permanently delete your account. Are you sure?");
        if (!confirmDelete) return;
        await api.delete('api/delete_account/');
        localStorage.clear();
        navigate('/');
        toast.success("Account deleted successfully!")

    };

  return (
<Base>
  <div className="settings-container">
    {loading ? (
      <div>
        <h1>Loading...</h1>
      </div>
    ) : (
      <>
        <h1>Account Settings</h1>
        <h4>Logged in as {username}</h4>
        <h4>Email: {email}</h4>

        <div className="d-flex flex-column align-items-center mt-4">
          <DetermineEmail email={email} />

          <Link to="/change_username">
            <button className="btn btn-warning btn-md mb-3">
              Change Username
            </button>
          </Link>

          <Link to="/change_password">
            <button className="btn btn-success btn-md mb-5">
              Change Password
            </button>
          </Link>

          <button
            onClick={handleLogout}
            className="btn btn-danger btn-md mb-3"
          >
            Log Out
          </button>

          <button
            onClick={handleDeleteAccount}
            className="btn btn-danger btn-md mb-3"
          >
            Delete Account
          </button>
        </div>
      </>
    )}
  </div>
</Base>
  );
}