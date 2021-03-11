"use strict";

const button = $(".navLink.both");
button.text("Sign Up");
button.attr("href", "/users/register/");
button.removeClass("current");

$(document).ready(function(){
  $("#submitButton").click(function() {
      toggleLoad();
      $.post("/users/check_login/",
      {
          username:$("#username").val(),
          password:$("#password").val()
      }, function(data, status){
          if (data == "false") {
            toggleLoad();
            showAlert("Your username/email or password was incorrect.");
          } else {
            $("#form").submit();
          }
      });
  });
});