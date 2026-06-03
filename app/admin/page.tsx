import { AdminDashboard } from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <AdminDashboard />
    </div>
  )
}
