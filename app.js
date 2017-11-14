//chrome.browserAction.setBadgeText({ text: "" });
// Global values
var isMenuOpen = false;

$(document).ready(function () {
    //$('.sidebar').hide();
    // Handle hamburger menu
    $('header').click(function (evt) {
        evt.stopPropagation();
        //$('.sidebar').removeClass('hidden');
        if (isMenuOpen) {
            $('#sidebar-content').hide();
            $('.sidebar').removeClass('visible-menu');
            $('.sidebar').addClass('hidden-menu');
            $('#hamburger-menu').removeClass('fa-times');
            $('#hamburger-menu').addClass('fa-bars');
        } else {
            $('.sidebar').removeClass('hidden-menu');
            $('.sidebar').addClass('visible-menu');
            $('#sidebar-content').show();
            $('#hamburger-menu').removeClass('fa-bars');
            $('#hamburger-menu').addClass('fa-times');
        }
        isMenuOpen = !isMenuOpen;
    });

    // Stop propagation for clicks on sidebar
    $('.sidebar').click(function (evt) {
        evt.stopPropagation();
    });

    // Handle click outside to close menu
    $(document).click(function () {
        $('#sidebar-content').hide();
        $('.sidebar').removeClass('visible-menu');
        $('.sidebar').addClass('hidden-menu');
        $('#hamburger-menu').removeClass('fa-times');
        $('#hamburger-menu').addClass('fa-bars');
        isMenuOpen = !isMenuOpen;
    });

    // Hide comments popup on app start
    $('.comments-popup').hide();

    // $('#customGoogleButton').click(function () {
    //     console.log('Hello');
    // });
});

// Initialize Firebase
// var config = {
//     apiKey: "AIzaSyBKZcsYQNgGzlrJHwrQVP1rUiWu_FHNGfM",
//     authDomain: "ziptag-thingstodo.firebaseapp.com",
//     databaseURL: "https://ziptag-thingstodo.firebaseio.com",
//     projectId: "ziptag-thingstodo",
//     storageBucket: "ziptag-thingstodo.appspot.com",
//     messagingSenderId: "52824648989"
// };

// firebase.initializeApp(config);
// firebase.auth().useDeviceLanguage();

// // Google federated login provider
// var googleProvider = new firebase.auth.GoogleAuthProvider();


