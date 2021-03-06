//chrome.browserAction.setBadgeText({ text: "" });
// Global values
var isMenuOpen = false;
var loggedInUser = null;
var loggedInUserID = null;

// Html strings
var htmlNoItemsFound = '<span class="no-items-found"> <i class="fa fa-thumb-tack"></i> No items found.</span>';

var UserPreferences = {};

// Firebase initialization
var config = {
    apiKey: "AIzaSyA2QZh5d0W7pV1HDBdfs1ODNDwIc5xvQn8",
    authDomain: "routbisu-thingstodo.firebaseapp.com",
    databaseURL: "https://routbisu-thingstodo.firebaseio.com",
    projectId: "routbisu-thingstodo",
    storageBucket: "routbisu-thingstodo.appspot.com",
    messagingSenderId: "866999882674"
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

// Toggle TaskLists
function toggleTaskLists() {
    if(UserPreferences.TaskCategory && UserPreferences.TaskCategory.Work) {
        $('#workList').fadeIn(); 
        $('#topTaskSelectorWork').addClass('active');
        $('#btnSelectWork').find('.i-type-selector').removeClass('fa-circle-o').addClass('fa-check-circle');
    } else {
        $('#workList').fadeOut();
        $('#topTaskSelectorWork').removeClass('active');
        $('#btnSelectWork').find('.i-type-selector').addClass('fa-circle-o').removeClass('fa-check-circle');        
    }

    if(UserPreferences.TaskCategory && UserPreferences.TaskCategory.Home) {
        $('#homeList').fadeIn(); 
        $('#topTaskSelectorHome').addClass('active');
        $('#btnSelectHome').find('.i-type-selector').removeClass('fa-circle-o').addClass('fa-check-circle');        
    }
    else {
        $('#homeList').fadeOut();
        $('#topTaskSelectorHome').removeClass('active');
        $('#btnSelectHome').find('.i-type-selector').addClass('fa-circle-o').removeClass('fa-check-circle');                
    }

    if(UserPreferences.TaskCategory && UserPreferences.TaskCategory.Personal) {
        $('#personalList').fadeIn(); 
        $('#topTaskSelectorPersonal').addClass('active');
        $('#btnSelectPersonal').find('.i-type-selector').removeClass('fa-circle-o').addClass('fa-check-circle');                
    }
    else {
        $('#personalList').fadeOut();
        $('#topTaskSelectorPersonal').removeClass('active');
        $('#btnSelectPersonal').find('.i-type-selector').addClass('fa-circle-o').removeClass('fa-check-circle');                        
    }

    if(UserPreferences.TaskCategory && UserPreferences.TaskCategory.Other) {
        $('#otherList').fadeIn(); 
        $('#topTaskSelectorOther').addClass('active');
        $('#btnSelectOther').find('.i-type-selector').removeClass('fa-circle-o').addClass('fa-check-circle');
    }
    else {
        $('#otherList').fadeOut();
        $('#topTaskSelectorOther').removeClass('active');
        $('#btnSelectOther').find('.i-type-selector').addClass('fa-circle-o').removeClass('fa-check-circle');  
    }

    // Save preferences in localstorage
    UserPreferences.SavePreferences();
    fetchTasks();
}

// Toggle task types
function toggleTaskTypes() {
    if(UserPreferences.TaskType) {
        toggleButton($('#pendingSelectTaskType'), UserPreferences.TaskType.Pending);
        toggleButton($('#completedSelectTaskType'), UserPreferences.TaskType.Completed);
    
        // Save preferences in localstorage
        UserPreferences.SavePreferences();
        fetchTasks();
    }
}

// Toggle date range for tasks
function toggleTaskRange() {
    resetAllTaskRange();
    switch(UserPreferences.TaskDate.Range) {
        case 'all':
            toggleButton($('#btnFilterAll'), true);
            break;
        case 'week':
            toggleButton($('#btnFilterWeek'), true);
            break;
        case 'month':
            toggleButton($('#btnFilterMonth'), true);
            break;
        case 'custom':
            toggleButton($('#btnFilterCustom'), true);
            $('.filter-date').fadeIn();
            break;
    }
    fetchTasks();
}

function resetAllTaskRange() {
    toggleButton($('#btnFilterWeek'), false);
    toggleButton($('#btnFilterMonth'), false);
    toggleButton($('#btnFilterCustom'), false);
    toggleButton($('#btnFilterAll'), false);
    $('.filter-date').fadeOut();
}

// Reset all filters
function resetAllFilters() {
    UserPreferences.TaskCategory = {
        Work: true,
        Personal: false,
        Home: false,
        Other: false,
    };
    toggleTaskLists();

    UserPreferences.TaskType = {
        Pending: true,
        Completed: false
    };
    toggleTaskTypes();

    UserPreferences.TaskDate.Range = 'all';
    toggleTaskRange();
}

// Adds a class 'selected' to a button if secondary parameter passed is truthy
function toggleButton(elem, flag) {
    if(flag)
        $(elem).addClass('selected');
    else
        $(elem).removeClass('selected');
}

//*****************************************************
// DAL Operations Section
//*****************************************************

// Adds a new task in firebase DB and returns a promise
function addNewTask(categoryName, taskDescription) {
    var tasksRef = database.ref(loggedInUserID + '/tasks');

    var newTask = {
        category: categoryName,
        user: loggedInUserID,
        desc: taskDescription,
        add_date: (new Date()).getTime(),
        completed_date: 0,
        comments: false
    };

    return tasksRef.push(newTask);
}

// Add a comment for a task, returns callbacks to handle success and error
function addNewComment(taskID, commentText, success, error) {
    try {
        var commentRef = database.ref(loggedInUserID + '/tasks/' + taskID + '/comments');
        
        var newComment = {
            desc: commentText,
            add_date: (new Date()).getTime()
        }

        return commentRef.push(newComment).then(function() {
            success();
        }, function() {
            error();
        });

    } catch(ex) {
        handleError('Task not found');
    }
} 

// Mark task as complete
// Mark task complete with current timestamp and return a promise
function markTaskComplete(taskID) {
    var taskRef = database.ref(loggedInUserID + '/tasks/' + taskID);
    
    // Current timestamp
    var currentTime = firebase.database.ServerValue.TIMESTAMP;
    return taskRef.update({completed_date: currentTime});
}

// Mark task as incpmplete
// Mark task incpmplete with current timestamp and return a promise
function markTaskIncomplete(taskID) {
    var taskRef = database.ref(loggedInUserID + '/tasks/' + taskID);
    
    // Current timestamp
    return taskRef.update({completed_date: 0});
}

// Toggle task status to pending or complete
function toggleTaskStatus(taskID) {
    var taskRef = database.ref(loggedInUserID + '/tasks/' + taskID);
    taskRef.once('value', function(s) {
        var taskDetails = s.val();
        if(taskDetails.completed_date > 0) {
            markTaskIncomplete(taskID).then(function() {
                fetchTasks();
            });
        } else {
            markTaskComplete(taskID).then(function() {
                fetchTasks();
            });
        }
    });
}

// Delete a task completely
function deleteTask(taskID) {
    var taskRef = database.ref(loggedInUserID + '/tasks/' + taskID);
    return taskRef.remove();
}

// Items to be displayed in popup
var USER_DATA = {};

var FilterData = {
  TaskDate: function(callback) {
    var currentTS = moment().unix() * 1000;
    var startTS = 0;

    switch (UserPreferences.TaskDate.Range) {
      case "week":
        startTS = currentTS - 1000 * 3600 * 24 * 7;
        break;

      case "month":
        startTS = currentTS - 1000 * 3600 * 24 * 30;
        break;

      case "custom":
        var fromDate = $("#fromDate").val();
        var toDate = $("#toDate").val();

        currentTS = getUnixTimestamp(toDate) || currentTS;
        startTS = getUnixTimestamp(fromDate) || startTS;
        break;
    }

    var USER_DATA_BKP = USER_DATA;
    USER_DATA = {};

    for (var itemName in USER_DATA_BKP) {
      var itemDetails = USER_DATA_BKP[itemName];
      if (
        itemDetails["add_date"] >= startTS &&
        itemDetails["add_date"] <= currentTS
      ) {
        USER_DATA[itemName] = itemDetails;
      }
    }

    callback();
  },
  TaskType: function(callback) {
    if (UserPreferences.TaskType) {
      // If user wants to view all items
      if (
        UserPreferences.TaskType.Pending &&
        UserPreferences.TaskType.Completed
      ) {
        database
          .ref(loggedInUserID + "/tasks")
          .once("value", function(snapshot) {
            USER_DATA = snapshot.val();
            callback();
          });
      } else {
        // Get all pending items
        if (UserPreferences.TaskType.Pending) {
          database
            .ref(loggedInUserID + "/tasks")
            .orderByChild("completed_date")
            .equalTo(0)
            .once("value", function(snapshot) {
              USER_DATA = snapshot.val();
              callback();
            });
          // Get all completed items
        } else {
          database
            .ref(loggedInUserID + "/tasks")
            .orderByChild("completed_date")
            .startAt(1)
            .endAt(9999999999999)
            .once("value", function(snapshot) {
              USER_DATA = snapshot.val();
              callback();
            });
        }
      }
    }
  }
};

// Convert datetime string to unix timestamp
// Input date format: YYYY-MM-DD
function getUnixTimestamp(timeStr) {
    var ts = moment(moment(timeStr, "YYYY-MM-DD").unix()*1000);
    if(ts._isValid) {
        return ts._i;
    }
    return false;
}

// Fetch tasks
// Input - instance of UserPreferences
// Output set the output in a global variable
function fetchTasks() {
    // Filter based on task type - Pending or Completed
    FilterData.TaskType(function() {
        FilterData.TaskDate(function() {
            showItemsInPopup();
        });
    });   
}

// Show items in popup
function showItemsInPopup() {
    var itemCounter = 0;
    var HtmlBody = { home: '', work: '', personal: '', other: ''};

    var taskHTMLHead = '<ul>';
    for(var itemName in USER_DATA) {
        var itemDetails = USER_DATA[itemName];
        var taskHTML = '<li><span class="date">' + formatDate(itemDetails['add_date'])
            + '</span><i class="task-toggle fa ' + 
            (itemDetails['completed_date'] == 0 ? 'fa-circle-o' : 'fa-check-circle') 
            + '" firebaseid="' + itemName + '"></i> '
            + (itemDetails['completed_date'] == 0 ? '' : '<span class="completed">') 
            + itemDetails['desc'] 
            + (itemDetails['completed_date'] == 0 ? '' : '</span>') 
            + ' </li>';
        HtmlBody[itemDetails['category']] += taskHTML;

        if(UserPreferences.TaskCategory[capitalizeFirstLetter(itemDetails['category'])])
            itemCounter++;
    }
    var taskHTMLTail = '</ul>';

    $('#workListItems, #personalListItems, #homeListItems, #otherListItems').html(htmlNoItemsFound);

    if(HtmlBody.work != '') $('#workListItems').html(taskHTMLHead + HtmlBody.work + taskHTMLTail);
    if(HtmlBody.personal != '') $('#personalListItems').html(taskHTMLHead + HtmlBody.personal + taskHTMLTail);
    if(HtmlBody.home != '') $('#homeListItems').html(taskHTMLHead + HtmlBody.home + taskHTMLTail);
    if(HtmlBody.other != '') $('#otherListItems').html(taskHTMLHead + HtmlBody.other + taskHTMLTail);

    $('#numTasksFound').text(itemCounter + ' task(s) found');
}

// Format firebase UNIX timestamp to DD-MMM-YYYY
function formatDate(firebaseUnixTS) {
    return moment.unix(firebaseUnixTS / 1000).format("DD-MMM-YYYY");
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

$(document).ready(function () {

    // Get preferences from localstorage    
    
    UserPreferences = {
        // Can be pending, complete, all
        TaskType: {
            Pending: true,
            Completed: false
        },
        TaskCategory: {
            Work: true,
            Personal: false,
            Home: false,
            Other: false,
        },
        TaskDate : {
            Range: 'all' // Can be 'week', 'month', 'all', 'custom'
        },
        // Get saved preferences from local storage
        GetPreferences: function() {
            if(this.TaskType) this.TaskType = JSON.parse(localStorage.getItem('TaskType'));
            if(this.TaskCategory) this.TaskCategory = JSON.parse(localStorage.getItem('TaskCategory'));
        },
        // Set user preferences in local storage
        SavePreferences: function() {
            localStorage.setItem('TaskType', JSON.stringify(this.TaskType));
            localStorage.setItem('TaskCategory', JSON.stringify(this.TaskCategory));
        }
    };

    if (localStorage.getItem('TaskType') == 'null' || !localStorage.getItem('TaskType')
        || localStorage.getItem('TaskCategory') == 'null' || !localStorage.getItem('TaskCategory')) {
            UserPreferences.SavePreferences();
    } else {
        UserPreferences.GetPreferences();
    }

    toggleTaskRange();

    // Hide all divs that are not required at initialization
    $('.comments-popup').hide();
    $('.login-container').hide();
    $('.container').hide();
    $('#login-text').hide();
    $('#content-loader').hide();
    $('.filter-date').hide();

    // Handle user preferences
    $('.select-task-type').click(function() {
        var type = $(this).attr('title');

        switch(type) {
            case 'pending':
                UserPreferences.TaskType.Pending = !UserPreferences.TaskType.Pending;
                toggleButton($(this), UserPreferences.TaskType.Pending);

                // If completed button in unchecked then check it
                if(!UserPreferences.TaskType.Completed) {
                    UserPreferences.TaskType.Completed = true;
                    toggleButton($('#completedSelectTaskType'), UserPreferences.TaskType.Completed);
                }

                break;

            case 'complete':
                UserPreferences.TaskType.Completed = !UserPreferences.TaskType.Completed;
                toggleButton($(this), UserPreferences.TaskType.Completed);

                // If pending button in unchecked then check it
                if(!UserPreferences.TaskType.Pending) {
                    UserPreferences.TaskType.Pending = true;
                    toggleButton($('#pendingSelectTaskType'), UserPreferences.TaskType.Pending);
                }

                break;
        }

        UserPreferences.SavePreferences();
        fetchTasks();
    });

    $('.select-task-range').click(function() {
        var range = $(this).attr('id');

        switch(range) {
            case 'btnFilterWeek':
                UserPreferences.TaskDate.Range = 'week';
                break;

            case 'btnFilterMonth':
                UserPreferences.TaskDate.Range = 'month';
                break;

            case 'btnFilterCustom':
                UserPreferences.TaskDate.Range = 'custom';
                break;

            case 'btnFilterAll':
                UserPreferences.TaskDate.Range = 'all';
                break;
        }

        toggleTaskRange();
    });

    $('.filter-date').blur(function() {
        UserPreferences.TaskDate.Range = 'custom';
        toggleTaskRange();
    });

    // Toggle all tasks lists
    toggleTaskLists();
    toggleTaskTypes();
    
    resetLoginForm();
    resetRegisterForm();

    // Reset all filters
    $('#btnResetFilters').click(function() {
        resetAllFilters();
        fetchTasks();
    });

    // Handle task type selector in nav menu
    $('.type-selector').click(function() {
        var btnType =  $(this).attr('id');
        switch(btnType) {
            case 'btnSelectWork':
                UserPreferences.TaskCategory.Work = !UserPreferences.TaskCategory.Work;
                break;
            case 'btnSelectPersonal':
                UserPreferences.TaskCategory.Personal = !UserPreferences.TaskCategory.Personal;
                break;
            case 'btnSelectHome':
                UserPreferences.TaskCategory.Home = !UserPreferences.TaskCategory.Home;
                break;
            case 'btnSelectOther':
                UserPreferences.TaskCategory.Other = !UserPreferences.TaskCategory.Other;
                break;
        }
        toggleTaskLists();
    });

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
    auth.onAuthStateChanged(function (user) {
        if (user) {
            // User is logged in.
            loggedInUser = user;
            loggedInUserID = user.uid;

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
        fetchTasks();
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

    // Show/Hide Signin & Signup forms
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
        UserPreferences.TaskCategory.Work = !UserPreferences.TaskCategory.Work;
        toggleTaskLists();
    });

    $('#topTaskSelectorPersonal').click(function() {
        UserPreferences.TaskCategory.Personal = !UserPreferences.TaskCategory.Personal;
        toggleTaskLists();
    });
    
    $('#topTaskSelectorHome').click(function() {
        UserPreferences.TaskCategory.Home = !UserPreferences.TaskCategory.Home;
        toggleTaskLists();
    });

    $('#topTaskSelectorOther').click(function() {
        UserPreferences.TaskCategory.Other = !UserPreferences.TaskCategory.Other;
        toggleTaskLists();
    });

    // Add a new task
    // On pressing enter in the textbox
    $('.add-task').on('keypress', function(e) {
        var taskText = $(this).val();
        var taskCategory = $(this).attr('title');

        if ($.trim(taskText) != '') {
            var code = e.keyCode || e.which;
            if(code == 13) {
                // Enter is pressed
                addNewTask(taskCategory, taskText).then(function() {
                    fetchTasks();
                });
                
                $(this).val('');
            }
        }
    });

    // Add task on pressing add button
    $('.add-button').click(function() {
        var $txt = $(this).parent().find('.add-task');
        var taskText = $txt.val();
        var taskCategory = $txt.attr('title');

        if ($.trim(taskText) != '') {
            addNewTask(taskCategory, taskText).then(function() {
                fetchTasks();
            });
            $($txt).val('');
        }
    });

    // Handle toggle task status
    $(document).on('click', '.task-toggle', function() {
        var taskId = $(this).attr('firebaseid');
        toggleTaskStatus(taskId);
    });

// End of document.ready
});


