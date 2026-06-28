import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGroups } from '@/actions/groups'
import GroupsApproved from '@/components/GroupsApproved'
import './groups-approved.css'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { groups } = await getGroups()

  return <GroupsApproved initialGroups={groups || []} currentUserId={user.id} />
}
