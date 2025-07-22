from django.db import models

class Allergy(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Drug(models.Model):
    FORM_CHOICES = [
        ('tablet', 'Tablet'),
        ('capsule', 'Capsule'),
        ('liquid', 'Liquid'),
        ('injection', 'Injection'),
        ('cream', 'Cream'),
        ('ointment', 'Ointment'),
        ('inhaler', 'Inhaler'),
        ('drops', 'Drops'),
    ]
    
    AVAILABILITY_CHOICES = [
        ('available', 'Available'),
        ('out_of_stock', 'Out of Stock'),
        ('discontinued', 'Discontinued'),
    ]
    
    name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200)
    strength = models.CharField(max_length=50)
    form = models.CharField(max_length=20, choices=FORM_CHOICES)
    category = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=200)
    dosage_instructions = models.TextField()
    side_effects = models.TextField(blank=True, null=True)
    contraindications = models.TextField(blank=True, null=True)
    interactions = models.TextField(blank=True, null=True)
    # Add allergy conflicts
    allergy_conflicts = models.ManyToManyField(Allergy, blank=True, related_name='conflicting_drugs')
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='available')
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} {self.strength} {self.form}"
