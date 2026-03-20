export type Locale = "th" | "en"

export const i18n = {
  th: {
    // nav
    nav_home: "หน้าหลัก", nav_list: "Party List", nav_search: "ค้นหา",
    nav_create: "สร้าง Party", nav_room: "ห้อง Party", nav_leader: "จัดการห้อง",
    nav_profile: "โปรไฟล์", nav_rating: "รีวิว", nav_notif: "แจ้งเตือน",
    // home
    hero_title: "หาเพื่อนเล่นเกม\nง่ายๆ ใน 1 คลิก",
    hero_sub: "สร้าง party, หาเพื่อนเล่น, คุยได้เลย",
    btn_browse: "📋 ดู Party ทั้งหมด", btn_create: "➕ สร้าง Party",
    stat_open: "🟢 Party เปิดอยู่", stat_online: "👥 Online ตอนนี้",
    stat_today: "🎮 Party วันนี้", stat_rating: "⭐ Rating เฉลี่ย",
    // party
    btn_join: "⚡ JOIN PARTY", btn_request: "📨 REQUEST TO JOIN",
    btn_notify: "🔔 NOTIFY ME WHEN OPEN",
    status_open: "OPEN", status_pending: "PENDING", status_full: "FULL", status_closed: "CLOSED",
    mode_auto: "🔓 Auto", mode_approve: "🔒 Approve",
    // time
    time_min: "นาทีที่แล้ว", time_hr: "ชั่วโมงที่แล้ว",
    time_yesterday: "เมื่อวาน", time_days: "วันที่แล้ว",
    // general
    see_all: "ดูทั้งหมด →", mark_read: "อ่านทั้งหมด",
    leave_party: "🚪 ออก Party", save: "💾 Save",
  },
  en: {
    nav_home: "Home", nav_list: "Party List", nav_search: "Search",
    nav_create: "Create Party", nav_room: "Party Room", nav_leader: "Leader Panel",
    nav_profile: "Profile", nav_rating: "Reviews", nav_notif: "Notifications",
    hero_title: "Find Gaming Friends\nin Just 1 Click",
    hero_sub: "Create a party, find teammates, chat before Discord",
    btn_browse: "📋 Browse Parties", btn_create: "➕ Create Party",
    stat_open: "🟢 Open Parties", stat_online: "👥 Online Now",
    stat_today: "🎮 Parties Today", stat_rating: "⭐ Avg Rating",
    btn_join: "⚡ JOIN PARTY", btn_request: "📨 REQUEST TO JOIN",
    btn_notify: "🔔 NOTIFY WHEN OPEN",
    status_open: "OPEN", status_pending: "PENDING", status_full: "FULL", status_closed: "CLOSED",
    mode_auto: "🔓 Auto", mode_approve: "🔒 Approve",
    time_min: "min ago", time_hr: "hr ago",
    time_yesterday: "Yesterday", time_days: "days ago",
    see_all: "See All →", mark_read: "Mark All Read",
    leave_party: "🚪 Leave Party", save: "💾 Save",
  }
}

export type I18nKey = keyof typeof i18n.th
