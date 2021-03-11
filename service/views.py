from datetime import datetime
from .models import Appointment
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required


@login_required
def close_appointment(request):
    if request.method == "POST":
        try:
            app_id = request.POST["id"]
            summary = request.POST["summary"]
            target_app = Appointment.objects.get(doctor=request.user,
                                                 id=app_id)
            target_app.post_summary = summary
            target_app.save()
            summaryMessage = target_app.summary_email()
            summaryMessage.send()
            return redirect(
                "/service/appointments/?alert=Summary Saved&alertType=success")
        except KeyError:
            return redirect("/service/appointments/")
        except Appointment.DoesNotExist:
            return redirect("/service/appointments/")
    else:
        try:
            app_id = request.GET["id"]
            target_app = Appointment.objects.get(doctor=request.user,
                                                 id=app_id)
            target_app.status = Appointment.CLOSED
            target_app.post_summary = "No Summary Provided"
            target_app.save()
            return render(request, 'writeSummary.html', {'app': target_app})
        except KeyError:
            return redirect("/service/appointments/")
        except Appointment.DoesNotExist:
            return redirect("/service/appointments/")


def complete(request):
    return render(request, 'appointmentComplete.html')


@login_required
def view_summary(request):
    try:
        id = request.GET["id"]
        attemptedApp = Appointment.objects.get(id=id, patient=request.user)
        return render(request, 'appointmentSummary.html',
                      {"app": attemptedApp})
    except KeyError:
        return redirect("/service/appointments/")
    except Appointment.DoesNotExist:
        return redirect("/service/appointments/")


@login_required
def cancel_appointment(request):
    if request.method == "POST":
        try:
            id = request.POST["id"]
            attemptedApp = Appointment.objects.get(id=id)
            attemptedApp.delete()
            return redirect(
                "/service/appointments/?alert=Appointment Canceled&alertType=success"
            )
        except KeyError:
            return redirect("/")
        except Appointment.DoesNotExist:
            return redirect("/")
    else:
        return redirect("/")


@login_required
def accept_appointment(request):
    if request.user.has_perm("users.accept_appointment"):
        if request.method == "POST":
            try:
                app_id = request.POST["id"]
                attemptedApp = Appointment.objects.get(id=app_id)
                attemptedApp.doctor = request.user
                attemptedApp.status = Appointment.SCHEDULED
                attemptedApp.save()
                acceptedMessage = attemptedApp.email()
                acceptedMessage.send()
                return redirect(
                    "/service/appointments/?alert=Appointment Accepted!&alertType=success"
                )
            except KeyError:
                return redirect("/")
            except Appointment.DoesNotExist:
                return redirect("/")
        else:
            return redirect("/")
    else:
        return redirect(
            "/service/appointments/?alert=Insufficient Permissions&alertType=error"
        )


@login_required
def view_appointments(request):
    apps = []
    doctor = None

    if request.user.has_perm("users.view_appointment_grid"):
        apps = list(
            Appointment.objects.filter(doctor=request.user).exclude(
                status=Appointment.CLOSED))
        doctor = True
    else:
        apps = list(Appointment.objects.filter(patient=request.user))
        doctor = False

    for i in apps:
        i.update()

    apps.sort(key=lambda app: app.scheduled, reverse=True)

    return render(request, 'appointmentList.html', {
        'apps': apps,
        'doctor': doctor
    })


@login_required
def view_available(request):
    if request.user.has_perm("users.view_appointment_grid"):
        apps = list(Appointment.objects.filter(status=Appointment.OPEN))
        apps.sort(key=lambda app: app.scheduled, reverse=True)
        return render(request, 'doctorList.html', {'apps': apps})
    else:
        return redirect(
            "/service/appointments/?alert=You Don't Have Permission To View Available Appointments&alertType=error"
        )


@login_required
def create_appointment(request):
    if request.user.has_perm("users.create_appointment"):
        currentAppointments = list(
            Appointment.objects.filter(patient=request.user).exclude(
                status=Appointment.CLOSED))
        if len(currentAppointments) < 3:
            if request.method == "POST":
                try:
                    issue = request.POST["issue"]
                    raw_date = request.POST["date"]
                    raw_time = request.POST["time"]
                    tz_offset = request.COOKIES.get('tz-offset')
                    try:
                        scheduled = datetime.strptime(
                            f"{raw_date}T{raw_time}|{tz_offset}",
                            "%Y-%m-%dT%H:%M|%z")
                    except ValueError:
                        return redirect(
                            "/service/create/?alert=Invalid Date&alertType=error"
                        )
                    issue = "No Issue Provided" if issue == "" else issue
                    newAppointment = Appointment.objects.create(
                        issue=issue,
                        doctor=None,
                        post_summary=None,
                        patient=request.user,
                        status=Appointment.OPEN,
                        scheduled=scheduled,
                        offset=tz_offset)
                    newAppointment.save()
                    return redirect("/service/appointments/")
                except KeyError:
                    return redirect(
                        "/service/create/?alert=Invalid Form Data&alertType=error"
                    )
            else:
                return render(request, "createAppointment.html")
        else:
            return redirect(
                "/service/appointments/?alert=Reached Max Non-Closed Appointments&alertType=error"
            )
    else:
        if request.user.confirmed:
            return redirect(
                "/service/appointments/?alert=You Don't Have Permission To Create Appointments&alertType=error"
            )
        else:
            return redirect(
                "/service/appointments/?alert=You Must Confirm You Email To Create Appointments&alertType=error"
            )


@login_required
def appointment(request):
    try:
        app_id = request.GET["id"]
        target_appointment = Appointment.objects.get(id=app_id)
        if target_appointment.status == Appointment.ONGOING:
            currentUser = request.user
            if currentUser == target_appointment.patient or currentUser == target_appointment.doctor:
                return render(request, "appointmentTemplate.html",
                              {'app': target_appointment})
            else:
                return redirect(
                    "/service/appointments/?alert=Invalid Appointment&alertType=error"
                )
        else:
            return redirect(
                "/service/appointments/?alert=This appointment is not available to join&alertType=error"
            )
    except Appointment.DoesNotExist:
        return redirect(
            "/service/appointments/?alert=Invalid Appointment&alertType=error")
    except KeyError:
        return redirect(
            "/service/appointments/?alert=Invalid Appointment&alertType=error")
