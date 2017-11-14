// Handle Google Login button
// Initialize Firebase
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

// Google federated login provider
var googleProvider = new firebase.auth.GoogleAuthProvider();

$(document).ready(function () {

    $('#customGoogleButton').click(function () {
        console.log('clicked');
        firebase.auth().signInWithPopup(googleProvider).then(function (result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            console.log(token);
            // The signed-in user info.
            var user = result.user;
            console.log(user);
            // ...
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
        });
    });
});