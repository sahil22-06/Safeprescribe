from django.db import models
from drugs.models import Allergy

class PatientAllergy(models.Model):
    patient = models.ForeignKey('Patient', on_delete=models.CASCADE, related_name='patient_allergies')
    allergy = models.ForeignKey(Allergy, on_delete=models.CASCADE, related_name='patient_allergies')
    reaction = models.CharField(max_length=255, blank=True, null=True)
    date_noted = models.DateField(blank=True, null=True)

    class Meta:
        unique_together = ('patient', 'allergy')

    def __str__(self):
        return f"{self.patient.full_name} - {self.allergy.name} ({self.reaction or 'No reaction specified'})"

class Patient(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField()
    emergency_contact = models.CharField(max_length=15, blank=True, null=True)
    medical_history = models.TextField(blank=True, null=True)
    allergies = models.ManyToManyField(Allergy, through=PatientAllergy, blank=True, related_name='patients')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-created_at']
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    @property
    def age(self):
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
