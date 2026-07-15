import { useState, useEffect } from 'react';
import "../styles/Form.css";
import Base from '../components/Base';
import LoadingIndicator from './LoadingIndicator';

function GeneralForm({
    mode,                             
    onSubmit,     
    showUsername = false,
    showPassword = false,   
    showEmailFirst = false,               
    showEmail = false,
    showNewPassword = false,
    showConfirmPassword = false,
    showName = false,
    showSubject = false, 
    showMessage = false,
    requireEmail = true,
    bottomText,                       
    title,
    usernameDescription = "Username", 
    passwordDescription = "Password",
}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');


    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({ username, password, newPassword, confirmPassword, email, subject, message });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = title;
    }, []);

    return (
        <Base>
            <form onSubmit={handleSubmit} className="form-container">
                <h1>{title}</h1>
                {showUsername && (
                    <div className="form-group">
                        <label className="input-description-label">{usernameDescription}</label>
                        <input required
                            className="form-input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                        />
                    </div>
                )}
                {showEmailFirst && (
                    <div className="form-group">
                        <label className="input-description-label">New Email</label>
                        <input 
                            required={requireEmail ? true : false}
                            className="form-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                        />
                    </div>
                )}
                {showPassword && (
                    <div className="form-group">
                        <label className="input-description-label">{passwordDescription}</label>
                        <input
                        required
                        className="form-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        />
                    </div>
                )}
                {showNewPassword && (
                    <div className="form-group">
                        <label className="input-description-label">New Password</label>
                        <input required
                            className="form-input"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                        />
                    </div>
                )}
                {showConfirmPassword && (
                    <div className="form-group">
                        <label className="input-description-label">Confirm Password</label>
                        <input required
                            className="form-input"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                        />
                    </div>
                )}
                {showEmail && (
                    <div className="form-group">
                        <label className="input-description-label">Email</label>
                        <input 
                            required={requireEmail ? true : false}
                            className="form-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                        />
                    </div>
                )}
                {showSubject && (
                    <div className="form-group">
                        <label className="input-description-label">Subject</label>
                        <input 
                            className="form-input"
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Subject"
                        />
                    </div>
                )}
                {showMessage && (
                    <div className="form-group">
                        <label className="input-description-label">Message</label>
                        <textarea
                            required
                            className="form-input"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Message"
                            rows={6} 
                        />
                    </div>
                )}

                {loading && <div className="loading">Loading...</div>}
                <button className="form-submit btn btn-success" type="submit">
                    {title}
                </button>
                <div style={{ marginTop: "20px" }} className="text-center">
                    {bottomText}
                </div>
            </form>
        </Base>
    );
}

export default GeneralForm;
