import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import type { Patient, PatientCreate, PatientUpdate } from '../../types/patient';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientCreate | PatientUpdate) => void;
  editingPatient?: Patient | null;
  isLoading?: boolean;
}

const genders = ['Male', 'Female', 'Other'] as const;
const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Other'] as const;

export default function PatientModal({
  isOpen,
  onClose,
  onSubmit,
  editingPatient,
  isLoading = false,
}: PatientModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: editingPatient
      ? {
          first_name: editingPatient.first_name,
          last_name: editingPatient.last_name,
          middle_name: editingPatient.middle_name || '',
          gender: editingPatient.gender || '',
          date_of_birth: editingPatient.date_of_birth,
          blood_group: editingPatient.blood_group || '',
          marital_status: editingPatient.marital_status || '',
          nationality: editingPatient.nationality || '',
          national_id: editingPatient.national_id || '',
          passport_number: editingPatient.passport_number || '',
          email: editingPatient.email || '',
          phone: editingPatient.phone || '',
          address: editingPatient.address || '',
          city: editingPatient.city || '',
          state: editingPatient.state || '',
          country: editingPatient.country || '',
          postal_code: editingPatient.postal_code || '',
          is_active: editingPatient.is_active,
        }
      : {
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

  useEffect(() => {
    if (isOpen) {
      if (editingPatient) {
        reset({
          first_name: editingPatient.first_name,
          last_name: editingPatient.last_name,
          middle_name: editingPatient.middle_name || '',
          gender: editingPatient.gender || '',
          date_of_birth: editingPatient.date_of_birth,
          blood_group: editingPatient.blood_group || '',
          marital_status: editingPatient.marital_status || '',
          nationality: editingPatient.nationality || '',
          national_id: editingPatient.national_id || '',
          passport_number: editingPatient.passport_number || '',
          email: editingPatient.email || '',
          phone: editingPatient.phone || '',
          address: editingPatient.address || '',
          city: editingPatient.city || '',
          state: editingPatient.state || '',
          country: editingPatient.country || '',
          postal_code: editingPatient.postal_code || '',
          is_active: editingPatient.is_active,
        });
      } else {
        reset({
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
        });
      }
    }
  }, [isOpen, editingPatient, reset]);

  if (!isOpen) return null;

  const onSubmitForm = (data: any) => {
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

    onSubmit(cleanedData);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white border border-border/50 rounded-3xl p-6 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in transform scale-100 mx-4"
        style={{
          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingPatient ? 'Edit Patient' : 'Add New Patient'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-accent/50 transition-all duration-200 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
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
          </div>

          {/* Identification Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Identification</h3>
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

          {/* Contact Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
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

          {/* Address Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Street Address</label>
                <textarea
                  {...register('address')}
                  rows={2}
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
          </div>

          {/* Status (only for editing) */}
          {editingPatient && (
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
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {isLoading ? 'Saving...' : editingPatient ? 'Update Patient' : 'Create Patient'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
