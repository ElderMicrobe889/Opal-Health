const names = ["daily", "family", "mental", "medical", "crisis"];

function switchOut(name){
    names.forEach(nameW => {
        $("#" + nameW).removeClass("picked");
        $(`#${nameW}img`).removeClass("picked");
    });
    $("#" + name).addClass("picked");
    $("#" + name + "img").addClass("picked");
}

names.forEach(name => {
    $(`#${name}img`).click(function(){switchOut(name)});
});

let current = 0;

$("#leftButton").css("opacity", "0");

$("#leftButton").click(function() {
    if (current == 1) {
        $(this).css("opacity", "0");
        $(this).css("pointer-events", "none");
    }
    if (current != 0) {
        current -= 1;
        switchOut(names[current]);
    }
    $("#rightButton").css("opacity", "1");
    $("#rightButton").css("pointer-events", "all");
});

$("#rightButton").click(function() {
    if (current == names.length - 2) {
        $(this).css("opacity", "0");
        $(this).css("pointer-events", "none");
    }
    if (current != names.length - 1) {
        current += 1;
        switchOut(names[current]);
    }
    $("#leftButton").css("opacity", "1");
    $("#leftButton").css("pointer-events", "all");
});

 $(document).ready(function() {
     const hash = (window.location.hash != "")? window.location.hash : `#${names[0]}img`;
     if (names.includes(hash.slice(1, -3))){
      $(hash).click();
      while (names[current] != hash.slice(1, -3)) {
          $("#rightButton").click();
      }
     }
 });