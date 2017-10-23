//chrome.browserAction.setBadgeText({ text: "" });
// Global values

$(document).ready(function() { 
    //$('.sidebar').hide();
    // Handle hamburger menu
    $('#hamburger-menu').click(function() {
        //$('.sidebar').removeClass('hidden');
        $('.sidebar').addClass('visible-menu');        
    })
});