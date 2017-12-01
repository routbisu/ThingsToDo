//chrome.browserAction.setBadgeText({ text: "" });
// Global values
var isMenuOpen = false;
var loggedInUser = null;

var SelectedTaskTypes = {
    Work: true,
    Personal: false,
    Home: false,
    Other: false
};

// Firebase initialization
var config = {
    apiKey: "AIzaSyBKZcsYQNgGzlrJHwrQVP1rUiWu_FHNGfM",
    authDomain: "ziptag-thingstodo.firebaseapp.com",
    databaseURL: "https://ziptag-thingstodo.firebaseio.com",
    projectId: "ziptag-thingstodo",
    storageBucket: "ziptag-thingstodo.appspot.com",
    messagingSenderId: "52824648989"
};

firebase.initializeApp(config);
firebase.auth().useDeviceLanguage();
var auth = firebase.auth();
var database = firebase.database();

// Reset login form
var resetLoginForm = function () {
    $('#txtEmailLogin').val('');
    $('#txtPasswordLogin').val('');
    $('#loginLoader').hide();
    $('#incorectLoginMsg').hide();
    $('#registerForm').hide();
}

// Reset Register form
var resetRegisterForm = function () {
    $('#txtEmailRegister').val('');
    $('#txtPasswordRegister').val('');
    $('#loginLoader').hide();
    $('#incorectLoginMsg').hide();
    $('#registerForm').hide();
}

// Hide all tasks lists
function hideTasksLists() {
    if(SelectedTaskTypes.Work) $('#workList').fadeIn(); else $('#workList').fadeOut();
    if(SelectedTaskTypes.Home) $('#homeList').fadeIn(); else $('#homeList').fadeOut();
    if(SelectedTaskTypes.Personal) $('#personalList').fadeIn(); else $('#personalList').fadeOut();
    if(SelectedTaskTypes.Other) $('#otherList').fadeIn(); else $('#otherList').fadeOut();
}

$(document).ready(function () {

    // Hide all divs that are not required at initialization
    $('.comments-popup').hide();
    $('.login-container').hide();
    $('.container').hide();
    $('#login-text').hide();
    $('#content-loader').hide();

    // Hide all tasks lists
    hideTasksLists();
    
    resetLoginForm();
    resetRegisterForm();

    // Stop the form from getting submitted
    $('#loginForm').submit(function (e) {
        e.preventDefault();
        return false;
    });

    // Stop the form from getting submitted
    $('#registerForm').submit(function (e) {
        e.preventDefault();
        return false;
    });

    // If no user is logged in then show the login division
    console.log(firebase.auth().currentUser);
    auth.onAuthStateChanged(function (user) {
        console.log(user);
        if (user) {
            // User is logged in.
            loggedInUser = user;

            $('.container').show();
            $('.login-container').hide();
            $('header').show();

            // Show user information in Profile pic section
            $('#userDisplayName').text(user.displayName);
            $('#userDisplayEmail').text(user.email);
            
        } else {
            // No user is logged in.
            $('.login-container').show();
            $('#loginForm').show(); 
            $('#registerForm').hide();            
            $('#login-text').hide();
            $('#register-text').show();

            $('.container').hide();
            $('header').hide();
        }
    });

    // Event handler for Sign Up button
    $('#btnAuthRegister').click(function () {
        // Show loader
        $('#loginLoader').show();
        $('#incorectLoginMsg').hide();

        var name = $('#txtNameRegister').val();
        var email = $('#txtEmailRegister').val();
        var password = $('#txtPasswordRegister').val();

        // Set authentication persistence to keep user logged even after browser is closed
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(function () {

                // Check is name is supplied
                if(!name || $.trim(name) == '') {
                    $('#loginLoader').hide();
                    $('#incorectLoginMsg').show();
                    $('#incorrect-login-msg').text('Please enter your name');
                    return false;
                }

                return auth.createUserWithEmailAndPassword(email, password)
                    .then(obj => {
                        resetLoginForm();

                        // Update the user's name
                        var user = auth.currentUser;
                        user.updateProfile({
                            displayName: name
                        });
                    })
                    .catch(err => {
                        $('#loginLoader').hide();
                        $('#incorectLoginMsg').show();
                        $('#incorrect-login-msg').text(err.message);
                        console.log(err);
                    });
            })
            .catch(function (error) {
                // Log Errors in error table
                console.log(error);
            });
    });

    // Event handler for login button
    $('#btnAuthLogin').click(function () {
        // Show loader
        $('#loginLoader').show();
        $('#incorectLoginMsg').hide();

        var email = $('#txtEmailLogin').val();
        var password = $('#txtPasswordLogin').val();

        // Set authentication persistence to keep user logged even after browser is closed
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(function () {
                return firebase.auth().signInWithEmailAndPassword(email, password)
                    .then(obj => {
                        resetLoginForm();
                    })
                    .catch(err => {
                        $('#loginLoader').hide();
                        $('#incorectLoginMsg').show();
                    });
            })
            .catch(function (error) {
                // Log Errors in error table
                console.log(error);
            });
    });

    // Show/Hide Signin & Singup forms
    $('#btnRegisterText').click(function () {
        $('#login-text').show();
        $('#register-text').hide();
        $('#registerForm').show();
        $('#loginForm').hide();
        $('#forgot-password-text').hide();
    });

    $('#btnLoginText').click(function () {
        $('#login-text').hide();
        $('#register-text').show();
        $('#registerForm').hide();
        $('#loginForm').show();
        $('#forgot-password-text').show();
    });

    // Handle forgot password
    $('#btnForgotPassword').click(function() {
        var email = $('#txtEmailLogin').val();
        if($.trim(email) == '') {
            $('#incorectLoginMsg').show();
            $('#incorrect-login-msg').text('Please enter your email address and click Forgot Password');
        } else {
            $('#loginLoader').show();
            $('#incorectLoginMsg').hide();
            auth.sendPasswordResetEmail(email)
                .then(_ => {
                    $('#loginLoader').hide();
                    $('#incorectLoginMsg').show();
                    $('#incorrect-login-msg').text('A password reset link has been sent to your email.');
                })
                .catch(err => {
                    if(err.code == 'auth/user-not-found') {
                        $('#incorrect-login-msg').text('This Email ID was not found in our records.');
                    }
                    $('#loginLoader').hide();
                    $('#incorectLoginMsg').show();
                });
        }
    });

    // Handle logout
    $('#btnLogout').click(function() {
        $('#sidebar-content').hide();
        $('.sidebar').removeClass('visible-menu');
        $('.sidebar').addClass('hidden-menu');
        $('#hamburger-menu').removeClass('fa-times');
        $('#hamburger-menu').addClass('fa-bars');
        isMenuOpen = !isMenuOpen;
        
        auth.signOut();        
    });

    // Handle task selector - Top section
    $('#topTaskSelectorWork').click(function() {
        SelectedTaskTypes.Work = !SelectedTaskTypes.Work;
        if(SelectedTaskTypes.Work) {
            $('#topTaskSelectorWork').addClass('active');
        } else {
            $('#topTaskSelectorWork').removeClass('active');
        }
        hideTasksLists();
    });

    $('#topTaskSelectorPersonal').click(function() {
        SelectedTaskTypes.Personal = !SelectedTaskTypes.Personal;
        if(SelectedTaskTypes.Personal) {
            $('#topTaskSelectorPersonal').addClass('active');
        } else {
            $('#topTaskSelectorPersonal').removeClass('active');
        }
        hideTasksLists();
    });
    
    $('#topTaskSelectorHome').click(function() {
        SelectedTaskTypes.Home = !SelectedTaskTypes.Home;
        if(SelectedTaskTypes.Home) {
            $('#topTaskSelectorHome').addClass('active');
        } else {
            $('#topTaskSelectorHome').removeClass('active');
        }
        hideTasksLists();
    });

    $('#topTaskSelectorOther').click(function() {
        SelectedTaskTypes.Other = !SelectedTaskTypes.Other;
        if(SelectedTaskTypes.Other) {
            $('#topTaskSelectorOther').addClass('active');
        } else {
            $('#topTaskSelectorOther').removeClass('active');
        }
        hideTasksLists();
    });

// End of document.ready
});


