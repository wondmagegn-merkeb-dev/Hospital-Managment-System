import { Users, Calendar, Pill, Activity } from 'lucide-react';

const stats = [
  { label: 'Total Patients', value: '1,234', icon: Users, color: 'text-blue-500' },
  { label: 'Today\'s Appointments', value: '45', icon: Calendar, color: 'text-green-500' },
  { label: 'Medicines in Stock', value: '892', icon: Pill, color: 'text-purple-500' },
  { label: 'Active Doctors', value: '28', icon: Activity, color: 'text-orange-500' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to Hospital Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br from-accent to-accent/50 shadow-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Recent Appointments
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent/30 to-accent/10 rounded-xl hover:from-accent/50 hover:to-accent/20 transition-all duration-200 hover:scale-[1.02] border border-border/30">
              <div>
                <p className="font-semibold">John Doe</p>
                <p className="text-sm text-muted-foreground">Dr. Smith - Cardiology</p>
              </div>
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-lg">10:00 AM</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent/30 to-accent/10 rounded-xl hover:from-accent/50 hover:to-accent/20 transition-all duration-200 hover:scale-[1.02] border border-border/30">
              <div>
                <p className="font-semibold">Jane Smith</p>
                <p className="text-sm text-muted-foreground">Dr. Johnson - Pediatrics</p>
              </div>
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-lg">11:30 AM</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 font-semibold">
              New Patient
            </button>
            <button className="p-4 bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground rounded-xl hover:from-secondary/90 hover:to-secondary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 font-semibold">
              New Appointment
            </button>
            <button className="p-4 bg-gradient-to-br from-accent to-accent/80 rounded-xl hover:from-accent/90 hover:to-accent shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 font-semibold">
              View Reports
            </button>
            <button className="p-4 bg-gradient-to-br from-accent to-accent/80 rounded-xl hover:from-accent/90 hover:to-accent shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 font-semibold">
              Manage Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
