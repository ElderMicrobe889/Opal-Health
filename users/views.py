from datetime import datetime
from django.conf import settings
import django.contrib.auth as auth
from django.contrib.auth.models import Group
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from .models import User, ConfirmationEmail, PassResetEmail
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError


def check_email_taken(email):
    return len(User.objects.filter(email=email)) > 0


def check_username_taken(username):
    return len(User.objects.filter(username=username)) > 0


@csrf_exempt
def check_password(request):
    if request.method == "POST":
        password = request.POST.get('password', '')
        try:
            auth.password_validation.validate_password(password,
                                                       user=request.user)
            return JsonResponse({'errors': ["Valid!"]})
        except auth.password_validation.ValidationError as pe:
            output = {'errors': list(pe)}
            return JsonResponse(output)
    else:
        return HttpResponse("Request is not POST!")


@csrf_exempt
def check_taken(request):
    if request.method == "POST":
        username = request.POST.get('username', '')
        email = request.POST.get('email', '')

        if check_email_taken(email):
            response = 'email'
        elif check_username_taken(username):
            response = 'username'
        else:
            response = 'none'

        return HttpResponse(response)
    else:
        return HttpResponse("Request is not POST!")


@csrf_exempt
def check_login(request):
    if request.method == "POST":
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')
        attemptedUser = auth.authenticate(request,
                                          username=username,
                                          password=password)
        response = 'true' if attemptedUser is not None else 'false'
        return HttpResponse(response)
    else:
        return HttpResponse("Request is not POST!")


@login_required
def change_password(request):
    if request.method == "POST":
        try:
            current_pass = request.POST["current_password"]
            new_pass = request.POST["new_password"]
            if passwordIsValid(new_pass):
                attemptedUser = auth.authenticate(
                    username=request.user.username, password=current_pass)
                if attemptedUser is not None:
                    attemptedUser.set_password(new_pass)
                    attemptedUser.save()
                    return redirect(
                        "/users/account/?alert=Password Reset&alertType=success"
                    )
                else:
                    return redirect(
                        "/users/account/?alert=Invalid Password!&alertType=error"
                    )
            else:
                return redirect(
                    "/users/account/?alert=New Password Is Not Good!&alertType=error"
                )
        except KeyError:
            return redirect("/")
    else:
        return redirect("/")


@login_required
def change_email(request):
    if request.method == "POST":
        try:
            new_email = request.POST['new_email']
            possibleUser = GetUserNameFromEmail(new_email)
            if possibleUser is not None:
                update = request.user
                try:
                    old = ConfirmationEmail.objects.get(user=request.user)
                    old.delete()
                except ConfirmationEmail.DoesNotExist:
                    pass
                update.email = new_email
                update.confirmed = False
                groupUpdate = Group.objects.get(name="Patients")
                try:
                    groupUpdate.user_set.remove(update)
                except ValueError:
                    pass
                update.save()
                groupUpdate.save()
                confirmEmail = ConfirmationEmail.objects.create(user=update)
                confirmMessage = confirmEmail.email()
                confirmMessage.send()
                return redirect(
                    "/users/account/?alert=Email changed and confirmation sent&alertType=success"
                )
            else:
                return redirect(
                    "/users/account/?alert=Email Is Already Registered!&alertType=error"
                )
        except KeyError:
            return redirect("/")


@login_required
def send_confirmation(request):
    try:
        old = ConfirmationEmail.objects.get(user=request.user)
        old.delete()
    except ConfirmationEmail.DoesNotExist:
        pass
    confirmEmail = ConfirmationEmail.objects.create(user=request.user)
    confirmMessage = confirmEmail.email()
    confirmMessage.send()
    return redirect(
        '/users/account/?alert=Confirmation sent&alertType=success')


def passwordIsValid(sourcePass, user=None):
    try:
        auth.password_validation.validate_password(sourcePass, user=user)
        return True
    except auth.password_validation.ValidationError:
        return False


def reset_request(request):
    if request.method == "POST":
        email = request.POST["email"]
        if email == "":
            return redirect(
                "/users/resetrequest/?alert=Email Can't Be Empty!&alertType=error"
            )
        else:
            try:
                targetUser = User.objects.get(email=email)
                try:
                    old = PassResetEmail.objects.get(user=targetUser)
                    old.delete()
                except PassResetEmail.DoesNotExist:
                    pass
                newMail = PassResetEmail.objects.create(user=targetUser)
                resetMessage = newMail.email()
                resetMessage.send()
                return redirect("/")
            except User.DoesNotExist:
                return redirect("/")
    else:
        return render(request, 'passResetRequest.html')


def reset_password(request):
    if request.method == "GET":
        try:
            targetId = request.GET["id"]
            targetMail = PassResetEmail.objects.get(id=targetId)
            rightnow = datetime.now().replace(tzinfo=None)
            diff = rightnow - targetMail.date_created.replace(tzinfo=None)
            if diff.days > 1:
                targetMail.delete()
                return redirect(
                    "/users/login/?alert=Password Reset Timed Out&alertType=error"
                )
            else:
                helpText = auth.password_validation.password_validators_help_text_html(
                )
                return render(request, 'resetPass.html', {
                    "mailId": targetId,
                    'passwordHelp': helpText
                })
        except PassResetEmail.DoesNotExist:
            return redirect("/")
        except ValidationError:
            return redirect("/")
        except KeyError:
            return redirect("/")
    elif request.method == "POST":
        try:
            targetId = request.POST["id"]
            newPass = request.POST["newPassword"]
            targetMail = PassResetEmail.objects.get(id=targetId)
            rightnow = datetime.now().replace(tzinfo=None)
            diff = rightnow - targetMail.date_created.replace(tzinfo=None)
            if diff.days > 1:
                targetMail.delete()
                return redirect(
                    "/users/login/?alert=Password Reset Timed Out&alertType=error"
                )
            else:
                if passwordIsValid(newPass):
                    targetMail.user.set_password(newPass)
                    targetMail.user.save()
                    targetMail.delete()
                    return redirect(
                        '/users/login/?alert=Password reset successfully, please login&alertType=success'
                    )
                else:
                    #JS SHOULD ALWAYS STOP THIS FOR THE USER
                    return redirect('/')
        except PassResetEmail.DoesNotExist:
            return redirect("/")
        except KeyError:
            return redirect("/")
    else:
        return redirect("/")


def confirm_email(request):
    try:
        targetId = request.GET["id"]
        targetMail = ConfirmationEmail.objects.get(id=targetId)
        targetMail.user.confirmed = True
        patientGroup = Group.objects.get(name="Patients")
        patientGroup.user_set.add(targetMail.user)
        patientGroup.save()
        targetMail.user.save()
        targetMail.delete()
        return redirect("/?alert=Email Confirmed!&alertType=success")
    except ConfirmationEmail.DoesNotExist:
        return redirect("/")
    except KeyError:
        return redirect("/")


def logout(request):
    auth.logout(request)
    return redirect('/users/login/?alert=Logged Out&alertType=info')


def delete_user(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            userPass = request.POST["password"]
            userName = request.user.username
            attemptedDelete = auth.authenticate(username=userName,
                                                password=userPass)
            if attemptedDelete is not None and attemptedDelete == request.user:
                attemptedDelete.delete()
                return redirect("/?alert=User Deleted&alertType=warning")
            else:
                return redirect(
                    "/users/account/?alert=Incorrect Password&alertType=error")
        else:
            return redirect("/")
    else:
        return redirect("/")


@login_required
def account(request):
    helpText = auth.password_validation.password_validators_help_text_html()
    return render(request, 'account.html', {"passwordHelp": helpText})


def login(request):
    if request.method == "POST":
        form = request.POST

        username = form["username"]
        password = form["password"]

        usernameFromEmail = GetUserNameFromEmail(username)

        username = usernameFromEmail if usernameFromEmail is not None else username

        attemptedUser = auth.authenticate(request,
                                          username=username,
                                          password=password)

        if attemptedUser is not None:
            auth.login(request, attemptedUser)
            next_url = request.POST.get("next", "/service/appointments/")
            return redirect(next_url)
        else:
            return redirect(
                "/users/login/?alert=Invalid Login&alertType=error")
    else:
        if request.user.is_authenticated:
            return redirect("/service/appointments/")
        else:
            next_page = request.GET.get("next", "/service/appointments/")
            return render(request, "login.html", {"next": next_page})


def GetUserNameFromEmail(email):
    try:
        attemptedUser = User.objects.get(email=email)
        return attemptedUser.username
    except User.DoesNotExist:
        return None


def register(request):
    if request.method == "POST":
        form = request.POST
        tz_offset = request.COOKIES.get('tz-offset')
        error = isValid(form, tz_offset)

        if error is None:
            firstName = form["first-name"]
            lastName = form["last-name"]
            email = form["email"]
            username = form["username"]
            password = form["password"]
            raw_date = form["date-of-birth"]
            date_of_birth = datetime.strptime(f"{raw_date}|{tz_offset}",
                                              "%Y-%m-%d|%z")

            newuser = User.objects.create_user(username=username,
                                               email=email,
                                               password=password)

            newuser.dateOfBirth = date_of_birth
            newuser.first_name = firstName
            newuser.last_name = lastName

            newuser.confirmed = False

            newuser.save()

            confirmEmail = ConfirmationEmail.objects.create(user=newuser)

            confirmMessage = confirmEmail.email()

            confirmMessage.send()

            auth.login(request, newuser)

            return redirect('/service/appointments/')
        else:
            return redirect(f'/users/register/?alert={error}')
    else:
        validators = list(settings.AUTH_PASSWORD_VALIDATORS)
        for ignored in settings.REGISTER_IGNORED_VALIDATORS:
            validators.remove(ignored)
        new_config = auth.password_validation.get_password_validators(
            validators)
        validator_help_list = auth.password_validation.password_validators_help_text_html(
            password_validators=new_config)
        return render(request, "register.html",
                      {'passwordHelp': validator_help_list})


def isValid(registerForm, tz_offset):

    for key in registerForm.keys():
        data = registerForm[key]
        if data is None or data == "":
            return f"{key} is empty!"

    email = registerForm["email"]
    username = registerForm["username"]
    password = registerForm["password"]
    dob = registerForm["date-of-birth"]

    try:
        date_of_birth = datetime.strptime(f"{dob}|{tz_offset}", "%Y-%m-%d|%z")
    except TypeError:
        return "Date Of Birth Invalid!"

    right_now = datetime.today()

    if right_now.replace(tzinfo=None).year - date_of_birth.replace(
            tzinfo=None).year < 18:
        return "Patient too young!"

    if check_email_taken(email):
        return "Email is taken!"

    if check_username_taken(username):
        return "Username is taken!"

    if not passwordIsValid(password):
        return "Password too short!"
