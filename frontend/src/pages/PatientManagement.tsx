import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Eye, Users, UserCheck, UserX, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { type Column } from '../components/TableWithPagination';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ListLayout, { type StatItem } from '../components/common/ListLayout';
import Tooltip from '../components/ui/Tooltip';
import ViewPatientModal from '../components/patient/ViewPatientModal';
import { usePatientsQuery } from '../hooks/usePatient';
import { getPatientsPaginated } from '../services/patientService';
import type { Patient } from '../types/patient';

export default function PatientManagement() {
  const navigate = useNavigate();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPatients = usePatientsQuery(searchTerm);

  // Fetch stats - get all patients with large page size to calculate stats
  const { data: statsData } = useQuery({
    queryKey: ['patients', 'stats'],
    queryFn: () => getPatientsPaginated(1, 1000, null, null, ''),
    staleTime: 30000, // Cache for 30 seconds
  });

  // Calculate stats from fetched data
  const stats: StatItem[] = useMemo(() => {
    if (!statsData) {
      return [
        {
          label: 'Total Patients',
          value: '0',
          icon: <Users className="w-6 h-6" />,
          color: 'text-blue-500',
        },
        {
          label: 'Active Patients',
          value: '0',
          icon: <UserCheck className="w-6 h-6" />,
          color: 'text-green-500',
        },
        {
          label: 'Inactive Patients',
          value: '0',
          icon: <UserX className="w-6 h-6" />,
          color: 'text-red-500',
        },
        {
          label: 'New This Month',
          value: '0',
          icon: <Calendar className="w-6 h-6" />,
          color: 'text-purple-500',
        },
      ];
    }

    const total = statsData.total;
    const activeCount = statsData.data.filter((patient) => patient.is_active).length;
    const inactiveCount = statsData.data.filter((patient) => !patient.is_active).length;
    
    // Count new patients this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = statsData.data.filter((patient) => {
      const registeredDate = new Date(patient.registered_at);
      return (
        registeredDate.getMonth() === currentMonth &&
        registeredDate.getFullYear() === currentYear
      );
    }).length;

    // If we have all patients (total <= 1000), use exact counts, otherwise estimate
    const sampleSize = statsData.data.length;
    const active = total <= 1000 ? activeCount : Math.round((activeCount / sampleSize) * total);
    const inactive = total <= 1000 ? inactiveCount : Math.round((inactiveCount / sampleSize) * total);
    const newThisMonthCount = total <= 1000 ? newThisMonth : Math.round((newThisMonth / sampleSize) * total);

    return [
      {
        label: 'Total Patients',
        value: total.toString(),
        icon: <Users className="w-6 h-6" />,
        color: 'text-blue-500',
      },
      {
        label: 'Active Patients',
        value: active.toString(),
        icon: <UserCheck className="w-6 h-6" />,
        color: 'text-green-500',
      },
      {
        label: 'Inactive Patients',
        value: inactive.toString(),
        icon: <UserX className="w-6 h-6" />,
        color: 'text-red-500',
      },
      {
        label: 'New This Month',
        value: newThisMonthCount.toString(),
        icon: <Calendar className="w-6 h-6" />,
        color: 'text-purple-500',
      },
    ];
  }, [statsData]);

  // Define table columns with sortable options
  const columns: Column<Patient>[] = [
    {
      header: 'Patient Code',
      accessor: (row: Patient) => (
        <div className="font-medium text-gray-900">{row.patient_code}</div>
      ),
      sortable: true,
      sortKey: 'patient_code',
    },
    {
      header: 'Full Name',
      accessor: (row: Patient) => (
        <div className="font-medium text-gray-900">
          {row.first_name} {row.middle_name ? `${row.middle_name} ` : ''}{row.last_name}
        </div>
      ),
      sortable: true,
      sortKey: 'first_name',
    },
    {
      header: 'Date of Birth',
      accessor: (row: Patient) => (
        <div className="text-sm text-gray-900">
          {new Date(row.date_of_birth).toLocaleDateString()}
        </div>
      ),
      sortable: true,
      sortKey: 'date_of_birth',
    },
    {
      header: 'Gender',
      accessor: (row: Patient) => (
        <div className="text-sm text-gray-900">{row.gender || 'N/A'}</div>
      ),
      sortable: true,
      sortKey: 'gender',
    },
    {
      header: 'Phone',
      accessor: (row: Patient) => (
        <div className="text-sm text-gray-900">{row.phone || 'N/A'}</div>
      ),
      sortable: true,
      sortKey: 'phone',
    },
    {
      header: 'Email',
      accessor: (row: Patient) => (
        <div className="text-sm text-gray-900">{row.email || 'N/A'}</div>
      ),
      sortable: true,
      sortKey: 'email',
    },
    {
      header: 'Status',
      accessor: (row: Patient) => (
        <Badge variant={row.is_active ? 'default' : 'secondary'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
      sortable: true,
      sortKey: 'is_active',
    },
    {
      header: 'Actions',
      accessor: (row: Patient) => (
        <div className="flex items-center justify-end gap-2">
          <Tooltip content="View Patient" position="top">
            <button
              onClick={() => handleView(row)}
              className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
              aria-label="View patient"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="Edit Patient" position="top">
            <button
              onClick={() => handleEdit(row)}
              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
              aria-label="Edit patient"
            >
              <Edit className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      ),
      sortable: false,
      className: 'text-right',
    },
  ];

  const handleView = (patient: Patient) => {
    setViewingPatient(patient);
    setViewModalOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    navigate(`/patients/edit/${patient.id}`);
  };

  return (
    <>
      <ListLayout<Patient>
        title="Patient Management"
        titleIcon={<Users className="w-6 h-6 md:w-7 md:h-7" />}
        description="Manage patient records and information"
        actionButtons={
          <Button
            onClick={() => navigate('/patients/add')}
            variant="default"
            size="default"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Add Patient</span>
          </Button>
        }
        stats={stats}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search patients..."
        queryFn={fetchPatients}
        queryKey={['patients', searchTerm]}
        columns={columns}
        emptyMessage="No patients found"
        emptyIcon={<Users className="w-16 h-16" />}
        emptyActionLabel="Add Patient"
        onEmptyAction={() => navigate('/patients/add')}
        initialPageSize={10}
        itemsPerPageOptions={[10, 25, 50, 100]}
      />

      {/* View Patient Modal */}
      <ViewPatientModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingPatient(null);
        }}
        patient={viewingPatient}
      />
    </>
  );
}
