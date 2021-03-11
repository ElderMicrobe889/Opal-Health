"use strict";

if (window.sessionStorage.getItem($(".alertLikeCloseButton").attr("id")) != null) {
    $(".alertLikeCloseButton").parent().parent().remove();
}

$(".alertLikeCloseButton").click(function() {
    $(this).parent().parent().remove();
    window.sessionStorage.setItem($(this).attr("id"), "closed");
});

$(".navLink").each(function(index, element){
    if ($(this).text() == document.title.trim()) {
        $(this).addClass("current");
    }
});

document.title = "Healine | " + document.title.trim();

$("#menuButton").click(function() {
    const elements = [$(this), $("body"), $("html")];
    elements.forEach(e => e.toggleClass("navOpen"));
    $("#menuContainer").slideToggle($("#menuContainer").css("--menuTransitionTime"));
});

$("#alertCloseButton").click(function() {
    $("#alertText").text("");
    $("#alertBox").removeClass("active");
});

function showAlert(alertText="An Error Occured", color="red") {
    $("#alertText").text(alertText);
    $("#alertBox").css("background-color", color);
    $("#alertBox").addClass("active");
}

const header = document.querySelector("header");
const observedElement = document.querySelector(".observed");

if (observedElement == null) {
    header.classList.add("scrolled");
}
else {
    const observedElementOptions = {
        rootMargin: "-150px 0px 0px 0px"
    };

    const observedElementObserver = new IntersectionObserver(function(entries, observedElementObserver) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                header.classList.remove("scrolled");
            }
            else {
                header.classList.add("scrolled");
            }
        });
    }, observedElementOptions);
    
    observedElementObserver.observe(observedElement);
}

function toggleLoad(){
  if ($('.submitLabel').css('display') == "none"){
    $('.submitLabel').css('display', 'initial');
    $('.submitLoading').css('display', 'none');
  } 
  else{
    $('.submitLoading').css('display', 'initial');
    $('.submitLabel').css('display', 'none');
  }
}

function getTzOffset(){
  let timezone_offset_min = new Date().getTimezoneOffset(),
    offset_hrs = parseInt(Math.abs(timezone_offset_min/60)),
    offset_min = Math.abs(timezone_offset_min%60),
    timezone_standard;

  if(offset_hrs < 10)
    offset_hrs = '0' + offset_hrs;

  if(offset_min < 10)
    offset_min = '0' + offset_min;

  if(timezone_offset_min < 0)
    timezone_standard = '+' + offset_hrs + ':' + offset_min;
  else if(timezone_offset_min > 0)
    timezone_standard = '-' + offset_hrs + ':' + offset_min;
  else if(timezone_offset_min == 0)
    timezone_standard = 'Z';

  return timezone_standard;
}
try {
if (Cookies.get('tz-offset') == null){
  const offset = getTzOffset();
  Cookies.set("tz-offset", offset, { expires: 7, secure: true });
}
}
catch {
    
}

(function($){
    
    $.fn.autoResize = function(options) {
        
        // Just some abstracted details,
        // to make plugin users happy:
        var settings = $.extend({
            onResize : function(){},
            animate : true,
            animateDuration : 150,
            animateCallback : function(){},
            extraSpace : 20,
            limit: 1000
        }, options);
        
        // Only textarea's auto-resize:
        this.filter('textarea').each(function(){
            
                // Get rid of scrollbars and disable WebKit resizing:
            var textarea = $(this).css({resize:'none','overflow-y':'hidden'}),
            
                // Cache original height, for use later:
                origHeight = textarea.height(),
                
                // Need clone of textarea, hidden off screen:
                clone = (function(){
                    
                    // Properties which may effect space taken up by chracters:
                    var props = ['height','width','lineHeight','textDecoration','letterSpacing'],
                        propOb = {};
                        
                    // Create object of styles to apply:
                    $.each(props, function(i, prop){
                        propOb[prop] = textarea.css(prop);
                    });
                    
                    // Clone the actual textarea removing unique properties
                    // and insert before original textarea:
                    return textarea.clone().removeAttr('id').removeAttr('name').css({
                        position: 'absolute',
                        top: 0,
                        left: -9999
                    }).css(propOb).attr('tabIndex','-1').insertBefore(textarea);
					
                })(),
                lastScrollTop = null,
                updateSize = function() {
					
                    // Prepare the clone:
                    clone.height(0).val($(this).val()).scrollTop(10000);
					
                    // Find the height of text:
                    var scrollTop = Math.max(clone.scrollTop(), origHeight) + settings.extraSpace,
                        toChange = $(this).add(clone);
						
                    // Don't do anything if scrollTip hasen't changed:
                    if (lastScrollTop === scrollTop) { return; }
                    lastScrollTop = scrollTop;
					
                    // Check for limit:
                    if ( scrollTop >= settings.limit ) {
                        $(this).css('overflow-y','');
                        return;
                    }
                    // Fire off callback:
                    settings.onResize.call(this);
					
                    // Either animate or directly apply height:
                    settings.animate && textarea.css('display') === 'block' ?
                        toChange.stop().animate({height:scrollTop}, settings.animateDuration, settings.animateCallback)
                        : toChange.height(scrollTop);
                };
            
            // Bind namespaced handlers to appropriate events:
            textarea
                .unbind('.dynSiz')
                .bind('keyup.dynSiz', updateSize)
                .bind('keydown.dynSiz', updateSize)
                .bind('change.dynSiz', updateSize);
            
        });
        
        // Chain:
        return this;
        
    };
    
    
    
})(jQuery);

$("textarea").autoResize();

$("textarea").change(function(){
    if($(this).val() != "") {
        $(this).addClass("filled");
    }
    else {
        $(this).removeClass("filled");
    }
});

$("button[type=\"submit\"]").click(function(){
    $("[required=\"required\"]").each(function(index, element){
        $(this).on("input", function() {
            if($(this).val() != "") {
                $(this).removeClass("required");
            }
        });
        if($(this).val() == "") {
            $(this).addClass("required");
        }
    });
});

$("h3 span.keepTogether").each(function(index, element){
    let value = $(this).html();
    let newvalue = "";
    for (let i = 0; i < value.length; i++) {
        let char = value[i];
        if(char == " ") {
            newvalue += "&nbsp;";
        }
        else {
            newvalue += char;
        }
    }
    newvalue += "<span style=\"color:rgba(0,0,0,0);\">5</span>";
    $(this).html(newvalue);
});

$(document).keypress(function(e){
  if (e.which == 13){
    $("#submitButton").click();
  }
});

function checkPassword(password){

  const passwordCheck = new Promise(((resolve, reject) => {

    $.post("/users/password_check/", {password}, function(data, status){

      resolve(data['errors']);

    });

  }));

  return passwordCheck;

}

//Use this function to check a password for debugging
//function testPass(password){checkPassword(password).then((value) => {console.log(value);});}