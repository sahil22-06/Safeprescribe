from rest_framework import serializers
from .models import Patient, PatientAllergy
from drugs.serializers import AllergySerializer

class PatientAllergySerializer(serializers.ModelSerializer):
    allergy = AllergySerializer(read_only=True)
    allergy_id = serializers.PrimaryKeyRelatedField(queryset=PatientAllergy._meta.get_field('allergy').related_model.objects.all(), source='allergy', write_only=True)

    class Meta:
        model = PatientAllergy
        fields = ['id', 'allergy', 'allergy_id', 'reaction', 'date_noted']

class PatientSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    detailed_allergies = PatientAllergySerializer(source='patient_allergies', many=True, required=False)
    
    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        allergies_data = validated_data.pop('patient_allergies', [])
        patient = Patient.objects.create(**validated_data)
        for allergy_data in allergies_data:
            PatientAllergy.objects.create(patient=patient, **allergy_data)
        return patient

    def update(self, instance, validated_data):
        allergies_data = validated_data.pop('patient_allergies', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if allergies_data is not None:
            instance.patient_allergies.all().delete()
            for allergy_data in allergies_data:
                PatientAllergy.objects.create(patient=instance, **allergy_data)
        return instance 