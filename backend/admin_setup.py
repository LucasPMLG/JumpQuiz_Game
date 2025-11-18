# Script to create a Django superuser programmatically.
# Intended to be executed inside the Django environment (e.g., `python manage.py shell < admin_setup.py`).
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jumpquiz.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()

USERNAME = os.environ.get('JQ_ADMIN_USERNAME', 'admin')
EMAIL = os.environ.get('JQ_ADMIN_EMAIL', 'admin@example.com')
PASSWORD = os.environ.get('JQ_ADMIN_PASSWORD', 'adminpass')

if not User.objects.filter(username=USERNAME).exists():
    User.objects.create_superuser(USERNAME, EMAIL, PASSWORD)
    print('Superuser created:', USERNAME)
else:
    print('Superuser already exists:', USERNAME)
