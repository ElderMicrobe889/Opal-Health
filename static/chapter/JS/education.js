const names = ["BCTC", "math", "science", "socialStudies", "techEd", "business", "art"];

function switchOut(name){
    names.forEach(nameW => {
        $("#" + nameW).removeClass("picked");
        $(`#${nameW}Div`).removeClass("picked");
    });
    $("#" + name).addClass("picked");
    $("#" + name + "Div").addClass("picked");
}

names.forEach(name => {
    $(`#${name}`).click(function(){switchOut(name)});
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