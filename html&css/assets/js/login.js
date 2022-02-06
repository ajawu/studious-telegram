"use strict";
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const swal = require('sweetalert');
const { remote } = require('electron');
const { app } = require('electron').remote;
const path = require('path');
const databasePath = path.join(app.getAppPath('userData').replace('app.asar', ''), 'data.db');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const loginLoader = document.getElementById('login-loader');
const errorField = document.getElementById('error-text');
/**
 * Saves the user email address as authenticated on successful login
 * @param emailAddress - email address of the user to be saved
 * @param userId Id of user on the database
 */
function saveAuth(emailAddress, userId, name) {
    window.localStorage.setItem('auth', JSON.stringify({
        email: emailAddress,
        id: userId,
        name: name,
    }));
}
/**
 * Hide or display the login button and loader based on the status parameter
 * @param buttonStatus
 */
function toggleLoginButton(buttonStatus = false) {
    if (buttonStatus === true) {
        loginButton.classList.add('btn-gray-800');
        loginButton.classList.remove('primary-hover');
        loginLoader.classList.add('d-none');
    }
    else {
        loginButton.classList.remove('btn-gray-800');
        loginButton.classList.add('primary-hover');
        loginLoader.classList.remove('d-none');
    }
}
/**
 * Confirms that the password saved for that email address matches the password and
 * saves authentication token if it does
 * @param emailAddress email address of the user
 * @param password password of the user to be validated
 */
function loginUser(emailAddress, password) {
    const db = new Database(databasePath, { verbose: console.log });
    try {
        const emailGetQuery = db.prepare('SELECT password, id, name FROM auth WHERE email= ?');
        const row = emailGetQuery.get(emailAddress);
        const passwordToCheck = row.password || 'wrong password';
        if (bcrypt.compareSync(password, passwordToCheck)) {
            saveAuth(emailAddress, row.id, row.name);
            remote
                .getCurrentWindow()
                .loadFile('html&css/pages/dashboard/dashboard.html');
        }
        else {
            toggleLoginButton(true);
            errorField.textContent = 'Username/Password entered is incorrect';
        }
    }
    catch (err) {
        toggleLoginButton(true);
        swal('Oops!', err.message, 'error');
    }
}
// login handler
loginButton.addEventListener('click', (e) => {
    e.preventDefault();
    errorField.textContent = '';
    toggleLoginButton(false);
    loginUser(emailField.value, passwordField.value);
});
