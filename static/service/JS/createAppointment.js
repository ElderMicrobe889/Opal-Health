let date = new Date();
date.setDate(date.getDate() + 1)
let datestring = date.toLocaleDateString();
$("#date").attr("min", `${datestring.slice(-4)}-${datestring.slice(0, 2)}-${datestring.slice(-7, -5)}`);

$("#submitButton").click(function(){
    setTimeout(function(){
        toggleLoad();
    }, 3500);
});