const popups = ["email", "change", "delete"];

$(document).ready(function(){
  popups.forEach(name => {
    $(`#${name}Change`).click(function(){
      $("body").toggleClass("popup_open");
      $("header").toggleClass("popup_open");
      $(`#${name}BG`).fadeIn(300);
      $(`#${name}BG`).css("overflow-y", "scroll");
      $(`#${name}BG`).addClass("popup_bg_open");
    });
    $(`#${name}Close`).click(function(){
      $("body").toggleClass("popup_open");
      $("header").toggleClass("popup_open");
      $(`#${name}BG`).fadeOut(300);
      $(`#${name}BG`).removeClass("popup_bg_open");
    }); 
  });

  $("#changePassSubmit").click(function(){
    checkPassword($("#new_password").val()).then((value) => {
      if (value[0] == "Valid!") 
      {
        $("#passwordError").css("display", "none");
        $("#passwordHelp").css("display", "none");
        $("#resetPassForm").submit();
      } else {
        $("#passwordError").css("display", "inline");
        $("#passwordHelp").css("display", "none");
        $("#errorList").empty();
        $.each(value, function(i){
          let error_li = $("<li/>");
          let to_add = value[i] == "You can not use a password that is already used in this application."? "You cannot use a password you've already used before." : value[i];
          error_li.text(to_add);
          error_li.appendTo($("#errorList"))
        });
      }      
    });
  });
});