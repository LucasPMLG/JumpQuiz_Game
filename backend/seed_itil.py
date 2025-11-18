# Run this script with the Django environment set (manage.py shell or django setup)
# It will create ITIL-themed yes/no questions.
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jumpquiz.settings')
django.setup()
from questions.models import Question

questions = [
    ('ITIL defines a service as a means of delivering value to customers by facilitating outcomes they want to achieve.', True),
    ('Change Management is primarily about blocking all changes to production to ensure stability.', False),
    ('A Configuration Management Database (CMDB) is used to track configuration items and relationships.', True),
    ('Incident Management aims to restore normal service operation as quickly as possible.', True),
    ('Problem Management only focuses on documenting incidents without preventing recurrence.', False),
    ('Service Level Agreements (SLAs) define agreed levels of service between provider and customer.', True),
    ('Continual Service Improvement (CSI) is a one-time activity performed at the end of each service lifecycle.', False),
    ('An event in ITIL can be any change of state that has significance for management of an IT service.', True),
    ('Capacity Management ensures services meet current and future capacity and performance requirements.', True),
    ('Availability Management focuses on maximizing downtime to reduce costs.', False),
]

for text, ans in questions:
    q, created = Question.objects.get_or_create(text=text, defaults={'answer': ans})
    if created:
        print('Created:', text)
    else:
        print('Exists:', text)
print('Seed complete.')
