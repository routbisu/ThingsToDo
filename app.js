//chrome.browserAction.setBadgeText({ text: "" });
// Global values
var isMenuOpen = false;

// Reset login form
var resetLoginForm = function() {
    $('#txtEmailLogin').val('');
    $('#txtPasswordLogin').val('');
    $('#loginLoader').hide();
    $('#incorectLoginMsg').hide();
}

$(document).ready(function () {

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
    
    // Hide all divs that are not required at initialization
    $('.comments-popup').hide();
    $('.login-container').hide();
    $('.container').hide();
    resetLoginForm();

    // Stop the form from getting submitted
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        return false;
    });

    // If no user is logged in then show the login division
    console.log(firebase.auth().currentUser);
    firebase.auth().onAuthStateChanged(function(user) {
        console.log(user);
        if (user) {
          // User is logged in.
          $('.container').show();
          $('.login-container').hide();
          $('header').show();
        } else {
          // No user is logged in.
          $('.login-container').show();
          $('.container').hide();
          $('header').hide();
        }
    });

    // Event handler for login button
    $('#btnAuthLogin').click(function() {
        // Show loader
        $('#loginLoader').show();
        $('#incorectLoginMsg').hide();

        var email = $('#txtEmailLogin').val();
        var password = $('#txtPasswordLogin').val();

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(obj => {
                resetLoginForm();
            })
            .catch(err => {
                $('#loginLoader').hide();
                $('#incorectLoginMsg').show();
            });
    });
   
});


