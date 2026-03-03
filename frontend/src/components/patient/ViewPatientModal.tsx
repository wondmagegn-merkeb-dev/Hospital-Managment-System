import { X, Phone, Mail, MapPin, User, Shield, Activity } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import type { Patient } from '../../types/patient';

interface ViewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export default function ViewPatientModal({
  isOpen,
  onClose,
  patient,
}: ViewPatientModalProps) {
  if (!isOpen || !patient) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
        className="bg-white border border-border/50 rounded-3xl p-8 w-full max-w-4xl shadow-2xl animate-fade-in transform scale-100 mx-4 relative overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-accent/50 transition-all duration-200 text-muted-foreground hover:text-foreground z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2
          className="text-2xl font-bold text-gray-900 mb-6 leading-tight tracking-tight"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: '24px',
            lineHeight: '1.2',
            letterSpacing: '-0.02em',
          }}
        >
          Patient Details
        </h2>

        {/* Patient Information */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Basic Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Patient Code
              </label>
              <div className="text-base font-medium text-gray-900">
                {patient.patient_code}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Status
              </label>
              <div>
                <Badge variant={patient.is_active ? 'default' : 'secondary'}>
                  {patient.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="text-base font-medium text-gray-900">
                {patient.first_name} {patient.middle_name ? `${patient.middle_name} ` : ''}{patient.last_name}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Date of Birth / Age
              </label>
              <div className="text-base font-medium text-gray-900">
                {formatDate(patient.date_of_birth)} ({calculateAge(patient.date_of_birth)} years)
              </div>
            </div>

            {patient.gender && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Gender
                </label>
                <div className="text-base font-medium text-gray-900">{patient.gender}</div>
              </div>
            )}

            {patient.blood_group && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Blood Group
                </label>
                <div className="text-base font-medium text-gray-900">{patient.blood_group}</div>
              </div>
            )}

            {patient.marital_status && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Marital Status
                </label>
                <div className="text-base font-medium text-gray-900">{patient.marital_status}</div>
              </div>
            )}

            {patient.nationality && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Nationality
                </label>
                <div className="text-base font-medium text-gray-900">{patient.nationality}</div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          {(patient.email || patient.phone) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patient.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Email
                      </p>
                      <p className="font-medium mt-0.5 break-all">{patient.email}</p>
                    </div>
                  </div>
                )}

                {patient.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Phone
                      </p>
                      <p className="font-medium mt-0.5">{patient.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Address */}
          {(patient.address || patient.city || patient.state || patient.country) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address
              </h3>
              <div className="text-base text-gray-900">
                {patient.address && <p>{patient.address}</p>}
                <p>
                  {[patient.city, patient.state, patient.postal_code].filter(Boolean).join(', ')}
                  {patient.country && `, ${patient.country}`}
                </p>
              </div>
            </div>
          )}

          {/* Emergency Contacts */}
          {patient.emergency_contacts && patient.emergency_contacts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Emergency Contacts ({patient.emergency_contacts.length})
              </h3>
              <div className="space-y-3">
                {patient.emergency_contacts.map((contact) => (
                  <div key={contact.id} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Name
                        </p>
                        <p className="font-medium">{contact.contact_name}</p>
                      </div>
                      {contact.contact_relationship && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Relationship
                          </p>
                          <p className="font-medium">{contact.contact_relationship}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Phone
                        </p>
                        <p className="font-medium">{contact.phone}</p>
                      </div>
                      {contact.email && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Email
                          </p>
                          <p className="font-medium">{contact.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insurances */}
          {patient.insurances && patient.insurances.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Insurance Policies ({patient.insurances.length})
              </h3>
              <div className="space-y-3">
                {patient.insurances.map((insurance) => (
                  <div key={insurance.id} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{insurance.provider_name}</p>
                        <p className="text-sm text-gray-600">Policy: {insurance.policy_number}</p>
                      </div>
                      {insurance.is_primary && (
                        <Badge variant="default">Primary</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      {insurance.coverage_percentage && (
                        <div>
                          <span className="text-muted-foreground">Coverage: </span>
                          <span className="font-medium">{insurance.coverage_percentage}%</span>
                        </div>
                      )}
                      {insurance.valid_from && insurance.valid_to && (
                        <div>
                          <span className="text-muted-foreground">Valid: </span>
                          <span className="font-medium">
                            {formatDate(insurance.valid_from)} - {formatDate(insurance.valid_to)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status History */}
          {patient.status_history && patient.status_history.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Status History
              </h3>
              <div className="space-y-2">
                {patient.status_history.map((history) => (
                  <div key={history.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{history.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(history.changed_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-border flex justify-end flex-shrink-0">
          <Button
            onClick={onClose}
            variant="default"
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
