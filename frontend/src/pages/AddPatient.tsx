import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import {
  useCreatePatient,
  useUpdatePatient,
  useAddEmergencyContact,
  useUpdateEmergencyContact,
  useDeleteEmergencyContact,
  useAddInsurance,
  useUpdateInsurance,
  useDeleteInsurance,
  useAddDocument,
  useDeleteDocument,
  useUpdatePatientStatus,
} from '../hooks/usePatient';
import { getPatientById } from '../services/patientService';
import type {
  PatientCreate,
  PatientUpdate,
} from '../types/patient';

const genders = ['Male', 'Female', 'Other'] as const;
const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Other'] as const;

export default function AddPatient() {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const isEditing = !!id;
  const [activeTab, setActiveTab] = useState('personal');

  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  
  // Hooks for managing related entities
  const addEmergencyContactMutation = useAddEmergencyContact();
  const updateEmergencyContactMutation = useUpdateEmergencyContact();
  const deleteEmergencyContactMutation = useDeleteEmergencyContact();
  const addInsuranceMutation = useAddInsurance();
  const updateInsuranceMutation = useUpdateInsurance();
  const deleteInsuranceMutation = useDeleteInsurance();
  const addDocumentMutation = useAddDocument();
  const deleteDocumentMutation = useDeleteDocument();
  const updateStatusMutation = useUpdatePatientStatus();
  
  // Form states for related entities
  const [showEmergencyContactForm, setShowEmergencyContactForm] = useState(false);
  const [editingEmergencyContact, setEditingEmergencyContact] = useState<string | null>(null);
  const [showInsuranceForm, setShowInsuranceForm] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<string | null>(null);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);

  // Fetch patient data if editing
  const { data: patientData, isLoading: isLoadingPatient, refetch: refetchPatient } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => getPatientById(id!),
    enabled: isEditing && !!id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      middle_name: '',
      gender: '',
      date_of_birth: '',
      blood_group: '',
      marital_status: '',
      nationality: '',
      national_id: '',
      passport_number: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      is_active: true,
    },
  });

  // Load patient data when editing
  useEffect(() => {
    if (patientData && isEditing) {
      reset({
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        middle_name: patientData.middle_name || '',
        gender: patientData.gender || '',
        date_of_birth: patientData.date_of_birth.split('T')[0],
        blood_group: patientData.blood_group || '',
        marital_status: patientData.marital_status || '',
        nationality: patientData.nationality || '',
        national_id: patientData.national_id || '',
        passport_number: patientData.passport_number || '',
        email: patientData.email || '',
        phone: patientData.phone || '',
        address: patientData.address || '',
        city: patientData.city || '',
        state: patientData.state || '',
        country: patientData.country || '',
        postal_code: patientData.postal_code || '',
        is_active: patientData.is_active,
      });
    }
  }, [patientData, isEditing, reset]);

  // Show loading state while fetching patient data
  if (isEditing && isLoadingPatient) {
    return (
      <div>
        <div className="text-center py-10">
          <p className="text-gray-500">Loading patient data...</p>
        </div>
      </div>
    );
  }

  const onSubmit = (data: any) => {
    // Clean up empty strings to null
    const cleanedData: any = {};
    Object.keys(data).forEach((key) => {
      if (data[key] === '' || data[key] === null) {
        cleanedData[key] = null;
      } else {
        cleanedData[key] = data[key];
      }
    });

    // Convert date_of_birth to ISO string if provided
    if (cleanedData.date_of_birth) {
      cleanedData.date_of_birth = new Date(cleanedData.date_of_birth).toISOString().split('T')[0];
    }

    if (isEditing && id) {
      updateMutation.mutate(
        { id, data: cleanedData as PatientUpdate },
        {
          onSuccess: () => {
            toast.success('Patient updated successfully');
            navigate('/patients');
          },
          onError: (err) => {
            const message = getErrorMessage(err);
            toast.error(message);
          },
        }
      );
    } else {
      createMutation.mutate(cleanedData as PatientCreate, {
        onSuccess: () => {
          toast.success('Patient created successfully');
          navigate('/patients');
        },
        onError: (err) => {
          const message = getErrorMessage(err);
          toast.error(message);
        },
      });
    }
  };

  const getErrorMessage = (err: unknown) => {
    const detail = (err as any)?.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d: any) => d?.msg || d?.message || JSON.stringify(d)).join(', ');
    }
    return (err as any)?.message || 'An error occurred';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/patients')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Patients
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Patient' : 'Add New Patient'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditing ? 'Update patient information' : 'Register a new patient in the system'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="personal" activeTab={activeTab} onClick={() => setActiveTab('personal')}>
                  Personal Info
                </TabsTrigger>
                <TabsTrigger value="contact" activeTab={activeTab} onClick={() => setActiveTab('contact')}>
                  Contact
                </TabsTrigger>
                <TabsTrigger value="address" activeTab={activeTab} onClick={() => setActiveTab('address')}>
                  Address
                </TabsTrigger>
                {isEditing && (
                  <>
                    <TabsTrigger value="emergency" activeTab={activeTab} onClick={() => setActiveTab('emergency')}>
                      Emergency Contacts
                    </TabsTrigger>
                    <TabsTrigger value="insurance" activeTab={activeTab} onClick={() => setActiveTab('insurance')}>
                      Insurance
                    </TabsTrigger>
                    <TabsTrigger value="documents" activeTab={activeTab} onClick={() => setActiveTab('documents')}>
                      Documents
                    </TabsTrigger>
                    <TabsTrigger value="status" activeTab={activeTab} onClick={() => setActiveTab('status')}>
                      Status
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal" activeTab={activeTab}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('first_name', { required: 'First name is required' })}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                        placeholder="Enter first name"
                      />
                      {errors.first_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.first_name.message as string}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('last_name', { required: 'Last name is required' })}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                        placeholder="Enter last name"
                      />
                      {errors.last_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.last_name.message as string}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Middle Name</label>
                      <input
                        {...register('middle_name')}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                        placeholder="Enter middle name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        {...register('date_of_birth', { required: 'Date of birth is required' })}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                      />
                      {errors.date_of_birth && (
                        <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message as string}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Gender</label>
                      <select
                        {...register('gender')}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                      >
                        <option value="">Select gender</option>
                        {genders.map((gender) => (
                          <option key={gender} value={gender}>
                            {gender}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Blood Group</label>
                      <input
                        {...register('blood_group')}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                        placeholder="e.g., A+, B-, O+"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Marital Status</label>
                      <select
                        {...register('marital_status')}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                      >
                        <option value="">Select marital status</option>
                        {maritalStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Nationality</label>
                      <input
                        {...register('nationality')}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                        placeholder="Enter nationality"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">National ID</label>
                      <input
                        {...register('national_id')}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                        placeholder="Enter national ID"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Passport Number</label>
                      <input
                        {...register('passport_number')}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                        placeholder="Enter passport number"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Contact Information Tab */}
              <TabsContent value="contact" activeTab={activeTab}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
                      <input
                        type="email"
                        {...register('email')}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Phone</label>
                      <input
                        type="tel"
                        {...register('phone')}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Address Tab */}
              <TabsContent value="address" activeTab={activeTab}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Street Address</label>
                    <textarea
                      {...register('address')}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                      placeholder="Enter street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">City</label>
                      <input
                        {...register('city')}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                        placeholder="Enter city"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">State/Province</label>
                      <input
                        {...register('state')}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                        placeholder="Enter state/province"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Country</label>
                      <input
                        {...register('country')}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                        placeholder="Enter country"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Postal Code</label>
                      <input
                        {...register('postal_code')}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                        placeholder="Enter postal code"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Emergency Contacts Tab */}
              {isEditing && (
                <TabsContent value="emergency" activeTab={activeTab}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Emergency Contacts</h3>
                      <Button
                        type="button"
                        onClick={() => setShowEmergencyContactForm(true)}
                        variant="default"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Contact
                      </Button>
                    </div>
                    {showEmergencyContactForm && (
                      <EmergencyContactForm
                        patientId={id!}
                        contactId={editingEmergencyContact}
                        onClose={() => {
                          setShowEmergencyContactForm(false);
                          setEditingEmergencyContact(null);
                        }}
                        onSuccess={() => {
                          setShowEmergencyContactForm(false);
                          setEditingEmergencyContact(null);
                        }}
                        existingContact={patientData?.emergency_contacts?.find((ec) => ec.id === editingEmergencyContact)}
                      />
                    )}
                    <div className="space-y-2">
                      {patientData?.emergency_contacts?.map((contact) => (
                        <div key={contact.id} className="p-4 border rounded-lg flex justify-between items-start">
                          <div>
                            <p className="font-medium">{contact.contact_name}</p>
                            {contact.contact_relationship && <p className="text-sm text-gray-600">{contact.contact_relationship}</p>}
                            <p className="text-sm text-gray-600">{contact.phone}</p>
                            {contact.email && <p className="text-sm text-gray-600">{contact.email}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEmergencyContact(contact.id);
                                setShowEmergencyContactForm(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this contact?')) {
                                  deleteEmergencyContactMutation.mutate(contact.id, {
                                    onSuccess: () => toast.success('Contact deleted'),
                                    onError: () => toast.error('Failed to delete contact'),
                                  });
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {(!patientData?.emergency_contacts || patientData.emergency_contacts.length === 0) && (
                        <p className="text-gray-500 text-center py-4">No emergency contacts added yet</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Insurance Tab */}
              {isEditing && (
                <TabsContent value="insurance" activeTab={activeTab}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Insurance Policies</h3>
                      <Button
                        type="button"
                        onClick={() => setShowInsuranceForm(true)}
                        variant="default"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Insurance
                      </Button>
                    </div>
                    {showInsuranceForm && (
                      <InsuranceForm
                        patientId={id!}
                        insuranceId={editingInsurance}
                        onClose={() => {
                          setShowInsuranceForm(false);
                          setEditingInsurance(null);
                        }}
                        onSuccess={() => {
                          setShowInsuranceForm(false);
                          setEditingInsurance(null);
                        }}
                        existingInsurance={patientData?.insurances?.find((ins) => ins.id === editingInsurance)}
                      />
                    )}
                    <div className="space-y-2">
                      {patientData?.insurances?.map((insurance) => (
                        <div key={insurance.id} className="p-4 border rounded-lg flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{insurance.provider_name}</p>
                              {insurance.is_primary && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Primary</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">Policy: {insurance.policy_number}</p>
                            {insurance.coverage_percentage && (
                              <p className="text-sm text-gray-600">Coverage: {insurance.coverage_percentage}%</p>
                            )}
                            {insurance.valid_from && insurance.valid_to && (
                              <p className="text-sm text-gray-600">
                                Valid: {new Date(insurance.valid_from).toLocaleDateString()} - {new Date(insurance.valid_to).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingInsurance(insurance.id);
                                setShowInsuranceForm(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this insurance?')) {
                                  deleteInsuranceMutation.mutate(insurance.id, {
                                    onSuccess: () => toast.success('Insurance deleted'),
                                    onError: () => toast.error('Failed to delete insurance'),
                                  });
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {(!patientData?.insurances || patientData.insurances.length === 0) && (
                        <p className="text-gray-500 text-center py-4">No insurance policies added yet</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Documents Tab */}
              {isEditing && (
                <TabsContent value="documents" activeTab={activeTab}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Documents</h3>
                      <Button
                        type="button"
                        onClick={() => setShowDocumentForm(true)}
                        variant="default"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Document
                      </Button>
                    </div>
                    {showDocumentForm && (
                      <DocumentForm
                        patientId={id!}
                        onClose={() => setShowDocumentForm(false)}
                        onSuccess={() => setShowDocumentForm(false)}
                      />
                    )}
                    <div className="space-y-2">
                      {patientData?.documents?.map((document) => (
                        <div key={document.id} className="p-4 border rounded-lg flex justify-between items-start">
                          <div>
                            <p className="font-medium">{document.document_type || 'Document'}</p>
                            <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                              View Document
                            </a>
                            <p className="text-sm text-gray-600">
                              Uploaded: {new Date(document.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this document?')) {
                                deleteDocumentMutation.mutate(document.id, {
                                  onSuccess: () => toast.success('Document deleted'),
                                  onError: () => toast.error('Failed to delete document'),
                                });
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(!patientData?.documents || patientData.documents.length === 0) && (
                        <p className="text-gray-500 text-center py-4">No documents uploaded yet</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Status Tab */}
              {isEditing && (
                <TabsContent value="status" activeTab={activeTab}>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register('is_active')}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Active Patient</span>
                      </label>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Status History</h3>
                      <Button
                        type="button"
                        onClick={() => setShowStatusForm(true)}
                        variant="default"
                        size="sm"
                        className="mb-4"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Status Change
                      </Button>
                      {showStatusForm && (
                        <StatusForm
                          patientId={id!}
                          onClose={() => setShowStatusForm(false)}
                          onSuccess={() => setShowStatusForm(false)}
                        />
                      )}
                      <div className="space-y-2">
                        {patientData?.status_history?.map((status) => (
                          <div key={status.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{status.status}</p>
                                <p className="text-sm text-gray-600">
                                  Changed: {new Date(status.changed_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!patientData?.status_history || patientData.status_history.length === 0) && (
                          <p className="text-gray-500 text-center py-4">No status history</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/patients')}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : isEditing
              ? 'Update Patient'
              : 'Create Patient'}
          </Button>
        </div>
      </form>
    </div>
  );

  // Emergency Contact Form Component
  function EmergencyContactForm({
    patientId,
    contactId,
    onClose,
    onSuccess,
    existingContact,
  }: {
    patientId: string;
    contactId: string | null;
    onClose: () => void;
    onSuccess: () => void;
    existingContact?: any;
  }) {
    const { register, handleSubmit, reset } = useForm({
      defaultValues: existingContact || {
        contact_name: '',
        contact_relationship: '',
        phone: '',
        email: '',
        address: '',
      },
    });

    useEffect(() => {
      if (existingContact) {
        reset(existingContact);
      }
    }, [existingContact, reset]);

    const onSubmit = (data: any) => {
      if (contactId) {
        updateEmergencyContactMutation.mutate(
          { contactId, data },
          {
            onSuccess: () => {
              toast.success('Contact updated');
              refetchPatient();
              onSuccess();
            },
            onError: (err) => toast.error(getErrorMessage(err)),
          }
        );
      } else {
        addEmergencyContactMutation.mutate(
          { patientId, data },
          {
            onSuccess: () => {
              toast.success('Contact added');
              refetchPatient();
              onSuccess();
            },
            onError: (err) => toast.error(getErrorMessage(err)),
          }
        );
      }
    };

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{contactId ? 'Edit Contact' : 'Add Emergency Contact'}</CardTitle>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Contact Name *</label>
                <input {...register('contact_name', { required: true })} className="w-full px-4 py-2 rounded-lg border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Relationship</label>
                <input {...register('contact_relationship')} className="w-full px-4 py-2 rounded-lg border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone *</label>
                <input {...register('phone', { required: true })} className="w-full px-4 py-2 rounded-lg border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input type="email" {...register('email')} className="w-full px-4 py-2 rounded-lg border" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Address</label>
                <textarea {...register('address')} rows={2} className="w-full px-4 py-2 rounded-lg border" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{contactId ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Insurance Form Component
  function InsuranceForm({
    patientId,
    insuranceId,
    onClose,
    onSuccess,
    existingInsurance,
  }: {
    patientId: string;
    insuranceId: string | null;
    onClose: () => void;
    onSuccess: () => void;
    existingInsurance?: any;
  }) {
    const { register, handleSubmit, reset } = useForm({
      defaultValues: existingInsurance || {
        provider_name: '',
        policy_number: '',
        coverage_percentage: '',
        coverage_limit: '',
        valid_from: '',
        valid_to: '',
        is_primary: false,
      },
    });

    useEffect(() => {
      if (existingInsurance) {
        reset({
          ...existingInsurance,
          valid_from: existingInsurance.valid_from ? existingInsurance.valid_from.split('T')[0] : '',
          valid_to: existingInsurance.valid_to ? existingInsurance.valid_to.split('T')[0] : '',
        });
      }
    }, [existingInsurance, reset]);

    const onSubmit = (data: any) => {
      const submitData = {
        ...data,
        coverage_percentage: data.coverage_percentage ? parseFloat(data.coverage_percentage) : null,
        coverage_limit: data.coverage_limit ? parseFloat(data.coverage_limit) : null,
      };
      if (insuranceId) {
        updateInsuranceMutation.mutate(
          { insuranceId, data: submitData },
          {
            onSuccess: () => {
              toast.success('Insurance updated');
              refetchPatient();
              onSuccess();
            },
            onError: (err) => toast.error(getErrorMessage(err)),
          }
        );
      } else {
        addInsuranceMutation.mutate(
          { patientId, data: submitData },
          {
            onSuccess: () => {
              toast.success('Insurance added');
              refetchPatient();
              onSuccess();
            },
            onError: (err) => toast.error(getErrorMessage(err)),
          }
        );
      }
    };

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{insuranceId ? 'Edit Insurance' : 'Add Insurance'}</CardTitle>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Provider Name *</label>
                <input {...register('provider_name', { required: true })} className="w-full px-4 py-2 rounded-lg border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Policy Number *</label>
                <input {...register('policy_number', { required: true })} className="w-full px-4 py-2 rounded-lg border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Coverage %</label>
                <input type="number" step="0.01" {...register('coverage_percentage')} className="w-full px-4 py-2 rounded-lg border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Coverage Limit</label>
                <input type="number" step="0.01" {...register('coverage_limit')} className="w-full px-4 py-2 rounded-lg border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Valid From</label>
                <input type="date" {...register('valid_from')} className="w-full px-4 py-2 rounded-lg border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Valid To</label>
                <input type="date" {...register('valid_to')} className="w-full px-4 py-2 rounded-lg border" />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('is_primary')} className="w-4 h-4" />
                  <span className="text-sm font-medium">Primary Insurance</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{insuranceId ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Document Form Component
  function DocumentForm({
    patientId,
    onClose,
    onSuccess,
  }: {
    patientId: string;
    onClose: () => void;
    onSuccess: () => void;
  }) {
    const { register, handleSubmit } = useForm({
      defaultValues: {
        document_type: '',
        file_url: '',
      },
    });

    const onSubmit = (data: any) => {
      addDocumentMutation.mutate(
        { patientId, data },
        {
          onSuccess: () => {
            toast.success('Document added');
            refetchPatient();
            onSuccess();
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        }
      );
    };

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Add Document</CardTitle>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Document Type</label>
              <input {...register('document_type')} className="w-full px-4 py-2 rounded-lg border" placeholder="e.g., ID, Insurance Card" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">File URL *</label>
              <input {...register('file_url', { required: true })} className="w-full px-4 py-2 rounded-lg border" placeholder="https://..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Add</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Status Form Component
  function StatusForm({
    patientId,
    onClose,
    onSuccess,
  }: {
    patientId: string;
    onClose: () => void;
    onSuccess: () => void;
  }) {
    const { register, handleSubmit } = useForm({
      defaultValues: {
        status: '',
      },
    });

    const statusOptions = ['Registered', 'Active', 'Admitted', 'Discharged', 'Blacklisted', 'Deceased'];

    const onSubmit = (data: any) => {
      updateStatusMutation.mutate(
        { patientId, data },
        {
          onSuccess: () => {
            toast.success('Status updated');
            refetchPatient();
            onSuccess();
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        }
      );
    };

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Add Status Change</CardTitle>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Status *</label>
              <select {...register('status', { required: true })} className="w-full px-4 py-2 rounded-lg border">
                <option value="">Select status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Add</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }
}
