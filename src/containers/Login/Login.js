import React from 'react';
import logo from '../../styles/images/logo.svg';
// import { Auth } from 'aws-amplify';
// import config from "../../internal/config";

/**
 * Login page that shows the login button for SSO sign in
 *
 * @returns {HTMLDivElement} Returns the Login page component
 */
function Login() {

    /**
     * Login button functionality.
     * Communicates with AWS Cognito service for federated sign in
     */
    const loginButtonClicked = () => {
        // Auth.federatedSignIn({provider: config.federatedSignInProvider});
    };

    return (
        <div className="wrapper login-wrapper">
            <div className="login-panel">
                <img data-testid='logo' src={logo} alt="Sysco Payplus" className="logo" />
                <p className="error-text hide"><i className="fi flaticon-alert" /> For security reasons you have been signed out automatically.</p>
                <div className="button-bar">
                <div data-testid='signin-msg' className="title">Please sign in to begin</div>
                <button data-testid='login-btn' className="loginbtn" onClick={() => loginButtonClicked()}>Sign In</button>
                </div>
            </div>            
        </div>
    );
}

export default Login;
