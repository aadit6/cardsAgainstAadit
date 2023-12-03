function UserValidation(){

    var email = document.getElementById("UserEmail").value;
    var username = document.getElementById("UserUsername").value;
    var pwd = documen.getElementById("UserPassword").value;

    // password validaion
    if (pwd.length < 10) {
        ReturnError("Password must be a minimum of 10 characters");
        return false;
    }
    if (!/[a-z]/.test(password)) {
        ReturnError("Password must have at least one lowercase character")
        return false;
    }
    if (!/\d/.test(password)) {
        ReturnError("Password must have at least one digit")
        return false;
    }
    if (!/[!\"£$%&*#@?]/.test(password)) {
        ReturnError("Password must have at least one special character (£$%&*#@?)")
        return false;
    }

    // email validation
    if (email.length === 0 || username.lengh === 0 || pwd.length  === 0) {
        return false;
    }
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) { 
        ReturnError("Email must be valid")
        return false;
    }

    // username validation
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
        ReturnError("Username is of an invalid format")
        return false;
    }

    ReturnError("none")
    return true;
}

function ReturnError(errorType) {
    // changed from original to remove color and appendErr=true. If issues come back to this
    var div = document.getElementById("errors");
    var error = document.createElement("error")

    div.innerHTML = "";
    if (errorType === "none") {
        return;
    }
    error.classList.add("alert alert-danger");
    error.innerHTML = "<b>Error: <b>" + error;
    div.appendChild(error);

}