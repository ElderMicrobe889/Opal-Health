let date = new Date();
date.setFullYear(date.getFullYear() - 18);
date.setDate(date.getDate() + 1);
let datestring = date.toLocaleDateString();
$("#dob").attr("max", `${datestring.slice(-4)}-${datestring.slice(0, 2)}-${datestring.slice(-7, -5)}`);

const getAge = birthDate => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10)

$(document).ready(function(){
  $("#submitButton").click(function() {
      toggleLoad();
      let email = $("#email").val();
      let atLocation = email.indexOf("@");
      let dotLocation = email.lastIndexOf(".");
      if(!email.includes("@") || !email.includes(".")) {
            toggleLoad();
            showAlert("You must use a valid email.");
            return;
      }
      else if(dotLocation - atLocation < 0) {
            toggleLoad();
            showAlert("You must use a valid email.");
            return;
      }
      else if (getAge($("#dob").val()) < 18) {

          toggleLoad();
          showAlert("Your must be at least 18 years old to register an account.");
          return;
      }
      else if ($("#password").val() != $("#confirmPassword").val()) {
          toggleLoad();
          showAlert("Passwords don't match.");
          return;
      }
      $.post("/users/check_taken/",
      {
          username:$("#username").val(),
          email
      }, function(data, status) {
          if (data == 'email') {
            toggleLoad();
            showAlert("That email is already taken.");
            return;
          }
          else if (data == 'username'){
            toggleLoad();
            showAlert("That username is already taken.");
            return;
          }
          else {
            checkPassword($("#password").val()).then((value) => {

              if (value[0] == "Valid!") 
              {
                $("#passwordError").css("display", "none");
                $("#passwordHelp").css("display", "none");
                $("#form").submit();
              } else {
                toggleLoad();
                $("#passwordError").css("display", "inline");
                $("#passwordHelp").css("display", "none");
                $("#errorList").empty();
                $.each(value, function(i){

                  let error_li = $("<li/>");
                  error_li.text(value[i]);
                  error_li.appendTo($("#errorList"))

                });
              } 
              
            });
          }
      });
  });
});