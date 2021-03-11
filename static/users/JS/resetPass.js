$(document).ready(function(){
  $("#submitButton").click(function() {
      toggleLoad();
      if ($("#newPassword").val() != $("#confirmPassword").val()) {
          toggleLoad();
          showAlert("Passwords don't match.");
          return;
      } else {
        checkPassword($("#new_password").val()).then((value) => {
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
              let to_add = value[i] == "You can not use a password that is already used in this application."? "You cannot use a password you've    already used before." : value[i];
              error_li.text(to_add);
              error_li.appendTo($("#errorList"))
            });
          }      
        });
      }
  });
});