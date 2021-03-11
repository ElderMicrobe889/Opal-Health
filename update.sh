echo Starting Up
set -a; source .env; set +a
echo Checking For/Downloading Changes Off GitHub
git pull
echo Installing any new packages
pip3 install -r requirements.txt
echo Updating Static Files
python manage.py collectstatic --noinput
echo Updating Database
python manage.py makemigrations
python manage.py migrate
echo Reloading Webapp
touch /var/www/healine_pythonanywhere_com_wsgi.py
echo Update Complete, please wait a bit for the webapp to reload