// ============================================================
// Drugbox seed script — creates 200+ accounts with realistic
// momentum: profiles, companies, listings, posts, groups, connections.
//
// Run with:  npm run seed
// Requires:  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in env
// ============================================================

import { createAdminClient } from '../lib/supabase/admin'
import * as D from './seed-data'

const supabase = createAdminClient()

const SEED_PASSWORD = 'Drugbox2026!' // demo password for all seeded accounts
const TARGET_USERS = 220

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
  }
  return out
}
function slugEmail(first: string, last: string, i: number): string {
  return `${first}.${last}.${i}`.toLowerCase().replace(/[^a-z0-9.]/g, '') + '@drugbox-demo.app'
}

async function main() {
  console.log('🌱 Seeding Drugbox...\n')

  // ---------- 1. USERS + PROFILES ----------
  console.log(`Creating ${TARGET_USERS} accounts...`)
  const userIds: string[] = []
  const userMeta: { id: string; name: string; company: string; country: string }[] = []

  // First account is always Dr. Haytham (the known demo login)
  const seedUsers = [
    { first: 'Haytham', last: 'Dweedar', headline: 'Chairman & CEO', company: 'Quadra Pharm', loc: { city: 'Giza, Egypt', country: 'EG' }, verified: true, email: 'haytham@drugbox.app' },
  ]

  for (let i = 1; i < TARGET_USERS; i++) {
    const first = pick(D.FIRST_NAMES_AR_EN)
    const last = pick(D.LAST_NAMES)
    seedUsers.push({
      first, last,
      headline: pick(D.HEADLINES),
      company: pick(D.COMPANIES),
      loc: pick(D.LOCATIONS),
      verified: Math.random() < 0.35,
      email: slugEmail(first, last, i),
    })
  }

  for (const u of seedUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { name: `Dr. ${u.first} ${u.last}` },
    })
    if (error || !data.user) {
      console.warn(`  ⚠️ skip ${u.email}: ${error?.message}`)
      continue
    }
    const id = data.user.id
    userIds.push(id)
    userMeta.push({ id, name: `Dr. ${u.first} ${u.last}`, company: u.company, country: u.loc.country })

    // The handle_new_user trigger already created a bare profile row; enrich it.
    await supabase.from('profiles').update({
      name: `Dr. ${u.first} ${u.last}`,
      headline: u.headline,
      company: u.company,
      location: u.loc.city,
      country: u.loc.country,
      bio: pick(D.BIOS),
      certifications: pickN(D.CERTS_POOL, 1 + Math.floor(Math.random() * 3)).join(', '),
      certs_verified_at: u.verified ? new Date().toISOString() : null,
      verified: u.verified,
      account_type: 'professional',
    }).eq('id', id)
  }
  console.log(`  ✅ ${userIds.length} accounts created\n`)

  // ---------- 2. COMPANIES ----------
  console.log('Creating company pages...')
  const companyIds: string[] = []
  for (let i = 0; i < 12; i++) {
    const owner = pick(userMeta)
    const cname = pick(D.COMPANIES)
    const { data, error } = await supabase.from('companies').insert({
      created_by: owner.id,
      name: cname,
      tagline: 'Advancing pharmaceutical excellence across MENA',
      about: pick(D.BIOS),
      city_country: pick(D.LOCATIONS).city,
      contact_email: `info@${cname.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      allow_messages: true,
      followers_count: Math.floor(Math.random() * 2000),
    }).select('id').single()
    if (!error && data) companyIds.push(data.id)
  }
  console.log(`  ✅ ${companyIds.length} company pages created\n`)

  // ---------- 3. LISTINGS (unified: supply/demand/service/cmo/job) ----------
  console.log('Creating listings...')
  let listingCount = 0

  const addListing = async (row: any) => {
    const { error } = await supabase.from('listings').insert(row)
    if (!error) listingCount++
  }

  for (const p of D.SUPPLY_PRODUCTS) {
    const owner = pick(userMeta)
    await addListing({
      user_id: owner.id, category: 'supply', role: 'offering',
      title: p.title, product_subtype: p.subtype, price_amount: p.price,
      price_unit: p.unit, moq: p.moq, certifications: p.certs,
      boosted: Math.random() < 0.25, status: 'active',
    })
  }
  for (const p of D.DEMAND_PRODUCTS) {
    const owner = pick(userMeta)
    await addListing({
      user_id: owner.id, category: 'demand', role: 'seeking',
      title: p.title, product_subtype: p.subtype, moq: p.moq, status: 'active',
    })
  }
  for (const s of D.SERVICES) {
    const owner = pick(userMeta)
    await addListing({
      user_id: owner.id, category: 'service', role: 'offering',
      title: s.title, status: 'active',
    })
  }
  for (const s of D.CMO_SERVICES) {
    const owner = pick(userMeta)
    await addListing({
      user_id: owner.id, category: 'cmo', role: 'offering',
      title: s.title, status: 'active',
    })
  }
  for (const j of D.JOBS) {
    const owner = pick(userMeta)
    await addListing({
      user_id: owner.id, category: 'job', role: 'offering',
      title: j.title, department: j.dept, seniority_level: j.level,
      employment_type: j.type, status: 'active',
    })
  }
  // Extra randomized supply listings to build volume
  for (let i = 0; i < 60; i++) {
    const p = pick(D.SUPPLY_PRODUCTS)
    const owner = pick(userMeta)
    await addListing({
      user_id: owner.id, category: 'supply', role: 'offering',
      title: p.title, product_subtype: p.subtype, price_amount: p.price,
      price_unit: p.unit, moq: p.moq, certifications: p.certs,
      boosted: Math.random() < 0.15, status: 'active',
    })
  }
  console.log(`  ✅ ${listingCount} listings created\n`)

  // ---------- 4. POSTS + reactions + comments ----------
  console.log('Creating feed posts...')
  let postCount = 0
  const postIds: string[] = []
  for (let i = 0; i < 80; i++) {
    const author = pick(userMeta)
    const tpl = pick(D.POSTS)
    const { data, error } = await supabase.from('posts').insert({
      user_id: author.id, body: tpl.body, category: tpl.category,
    }).select('id').single()
    if (!error && data) { postCount++; postIds.push(data.id) }
  }
  // reactions
  for (const pid of postIds) {
    const reactors = pickN(userMeta, Math.floor(Math.random() * 15))
    for (const r of reactors) {
      await supabase.from('reactions').insert({
        post_id: pid, user_id: r.id, kind: pick(['like', 'celebrate', 'support', 'insightful']),
      })
    }
  }
  console.log(`  ✅ ${postCount} posts + reactions created\n`)

  // ---------- 5. GROUPS + members ----------
  console.log('Creating groups...')
  const groupIds: string[] = []
  for (const g of D.GROUPS) {
    const creator = pick(userMeta)
    const { data, error } = await supabase.from('groups').insert({
      created_by: creator.id, name: g.name, description: g.desc, emoji: g.emoji,
    }).select('id').single()
    if (!error && data) {
      groupIds.push(data.id)
      // add random members
      const members = pickN(userMeta, 20 + Math.floor(Math.random() * 60))
      for (const m of members) {
        await supabase.from('group_members').insert({
          group_id: data.id, user_id: m.id, role: 'member',
        })
      }
    }
  }
  console.log(`  ✅ ${groupIds.length} groups created\n`)

  // ---------- 6. CONNECTIONS ----------
  console.log('Creating connections...')
  let connCount = 0
  for (let i = 0; i < 300; i++) {
    const [a, b] = pickN(userMeta, 2)
    if (!a || !b || a.id === b.id) continue
    const { error } = await supabase.from('connections').insert({
      requester_id: a.id, addressee_id: b.id,
      status: Math.random() < 0.7 ? 'accepted' : 'pending',
      responded_at: new Date().toISOString(),
    })
    if (!error) connCount++
  }
  console.log(`  ✅ ${connCount} connections created\n`)

  console.log('🎉 Seed complete!')
  console.log(`\n   Demo login:  haytham@drugbox.app  /  ${SEED_PASSWORD}`)
  console.log(`   Total: ${userIds.length} users, ${listingCount} listings, ${postCount} posts, ${groupIds.length} groups\n`)
}

main().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})
