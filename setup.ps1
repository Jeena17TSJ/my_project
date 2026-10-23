# ============================================================
#  DentalCare Dental Clinic - Full Project Structure Setup
#  Run: .\setup.ps1 inside your project root folder
# ============================================================

$base = Get-Location

function New-Dir($path) {
    $full = Join-Path $base $path
    if (-not (Test-Path $full)) {
        New-Item -ItemType Directory -Path $full -Force | Out-Null
        Write-Host "  [DIR]  $path" -ForegroundColor Cyan
    }
}

function New-File($path, $content = "") {
    $full = Join-Path $base $path
    $dir  = Split-Path $full -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    if (-not (Test-Path $full)) {
        Set-Content -Path $full -Value $content
        Write-Host "  [FILE] $path" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  DentalCare Dental Clinic - Setup" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

# ── APP / PUBLIC ROUTES ─────────────────────────────────────
New-Dir "app/(public)"
New-File "app/(public)/page.tsx"

New-Dir "app/(public)/about"
New-File "app/(public)/about/page.tsx"

New-Dir "app/(public)/services"
New-File "app/(public)/services/page.tsx"
New-File "app/(public)/services/[slug]/page.tsx"

New-Dir "app/(public)/contact"
New-File "app/(public)/contact/page.tsx"

New-Dir "app/(public)/appointment"
New-File "app/(public)/appointment/page.tsx"

# ── APP / AUTH ROUTES ────────────────────────────────────────
New-Dir "app/(auth)/login"
New-File "app/(auth)/login/page.tsx"

New-Dir "app/(auth)/register"
New-File "app/(auth)/register/page.tsx"

# ── APP / DASHBOARD - ADMIN ──────────────────────────────────
New-Dir "app/(dashboard)/admin"
New-File "app/(dashboard)/admin/page.tsx"
New-File "app/(dashboard)/admin/layout.tsx"

New-Dir "app/(dashboard)/admin/users"
New-File "app/(dashboard)/admin/users/page.tsx"

New-Dir "app/(dashboard)/admin/appointments"
New-File "app/(dashboard)/admin/appointments/page.tsx"

New-Dir "app/(dashboard)/admin/patients"
New-File "app/(dashboard)/admin/patients/page.tsx"

New-Dir "app/(dashboard)/admin/doctors"
New-File "app/(dashboard)/admin/doctors/page.tsx"

New-Dir "app/(dashboard)/admin/billing"
New-File "app/(dashboard)/admin/billing/page.tsx"

New-Dir "app/(dashboard)/admin/records"
New-File "app/(dashboard)/admin/records/page.tsx"

New-Dir "app/(dashboard)/admin/clinic"
New-File "app/(dashboard)/admin/clinic/page.tsx"

New-Dir "app/(dashboard)/admin/communication"
New-File "app/(dashboard)/admin/communication/page.tsx"

New-Dir "app/(dashboard)/admin/roles"
New-File "app/(dashboard)/admin/roles/page.tsx"

New-Dir "app/(dashboard)/admin/reports"
New-File "app/(dashboard)/admin/reports/page.tsx"

New-Dir "app/(dashboard)/admin/settings"
New-File "app/(dashboard)/admin/settings/page.tsx"

# ── APP / DASHBOARD - PATIENT ────────────────────────────────
New-Dir "app/(dashboard)/patient"
New-File "app/(dashboard)/patient/page.tsx"
New-File "app/(dashboard)/patient/layout.tsx"

New-Dir "app/(dashboard)/patient/appointments"
New-File "app/(dashboard)/patient/appointments/page.tsx"

New-Dir "app/(dashboard)/patient/records"
New-File "app/(dashboard)/patient/records/page.tsx"

New-Dir "app/(dashboard)/patient/billing"
New-File "app/(dashboard)/patient/billing/page.tsx"

# ── APP / DASHBOARD - DOCTOR ─────────────────────────────────
New-Dir "app/(dashboard)/doctor"
New-File "app/(dashboard)/doctor/page.tsx"
New-File "app/(dashboard)/doctor/layout.tsx"

New-Dir "app/(dashboard)/doctor/appointments"
New-File "app/(dashboard)/doctor/appointments/page.tsx"

New-Dir "app/(dashboard)/doctor/patients"
New-File "app/(dashboard)/doctor/patients/page.tsx"

New-Dir "app/(dashboard)/doctor/records"
New-File "app/(dashboard)/doctor/records/page.tsx"

# ── APP / API ROUTES ─────────────────────────────────────────
New-Dir "app/api/auth/[...nextauth]"
New-File "app/api/auth/[...nextauth]/route.ts"

New-Dir "app/api/auth/register"
New-File "app/api/auth/register/route.ts"

New-Dir "app/api/appointments"
New-File "app/api/appointments/route.ts"

New-Dir "app/api/appointments/[id]"
New-File "app/api/appointments/[id]/route.ts"

New-Dir "app/api/patients"
New-File "app/api/patients/route.ts"

New-Dir "app/api/patients/[id]"
New-File "app/api/patients/[id]/route.ts"

New-Dir "app/api/doctors"
New-File "app/api/doctors/route.ts"

New-Dir "app/api/doctors/[id]"
New-File "app/api/doctors/[id]/route.ts"

New-Dir "app/api/billing"
New-File "app/api/billing/route.ts"

New-Dir "app/api/billing/[id]"
New-File "app/api/billing/[id]/route.ts"

New-Dir "app/api/records"
New-File "app/api/records/route.ts"

New-Dir "app/api/records/[id]"
New-File "app/api/records/[id]/route.ts"

New-Dir "app/api/users"
New-File "app/api/users/route.ts"

New-Dir "app/api/users/[id]"
New-File "app/api/users/[id]/route.ts"

New-Dir "app/api/notifications"
New-File "app/api/notifications/route.ts"

New-Dir "app/api/reports"
New-File "app/api/reports/route.ts"

New-Dir "app/api/contact"
New-File "app/api/contact/route.ts"

New-Dir "app/api/chatbot"
New-File "app/api/chatbot/route.ts"

New-Dir "app/api/clinic"
New-File "app/api/clinic/route.ts"

# ── APP ROOT FILES ───────────────────────────────────────────
New-File "app/layout.tsx"
New-File "app/providers.tsx"
New-File "app/globals.css"

# ── COMPONENTS / LAYOUT ──────────────────────────────────────
New-Dir "components/layout"
New-File "components/layout/Navbar.tsx"
New-File "components/layout/Footer.tsx"
New-File "components/layout/Sidebar.tsx"
New-File "components/layout/AdminSidebar.tsx"
New-File "components/layout/DoctorSidebar.tsx"
New-File "components/layout/PatientSidebar.tsx"
New-File "components/layout/DashboardLayout.tsx"

# ── COMPONENTS / UI ──────────────────────────────────────────
New-Dir "components/ui"
New-File "components/ui/Button.tsx"
New-File "components/ui/Input.tsx"
New-File "components/ui/Modal.tsx"
New-File "components/ui/Table.tsx"
New-File "components/ui/Card.tsx"
New-File "components/ui/Badge.tsx"
New-File "components/ui/Toast.tsx"
New-File "components/ui/Spinner.tsx"
New-File "components/ui/Pagination.tsx"
New-File "components/ui/ConfirmDialog.tsx"
New-File "components/ui/Avatar.tsx"
New-File "components/ui/StatusBadge.tsx"

# ── COMPONENTS / HOME ────────────────────────────────────────
New-Dir "components/home"
New-File "components/home/HeroSection.tsx"
New-File "components/home/ServicesSection.tsx"
New-File "components/home/TestimonialsSection.tsx"
New-File "components/home/StatsSection.tsx"
New-File "components/home/DoctorsSection.tsx"
New-File "components/home/WhyChooseUs.tsx"
New-File "components/home/CTASection.tsx"

# ── COMPONENTS / APPOINTMENT ─────────────────────────────────
New-Dir "components/appointment"
New-File "components/appointment/AppointmentForm.tsx"
New-File "components/appointment/AppointmentCalendar.tsx"
New-File "components/appointment/TimeSlotPicker.tsx"
New-File "components/appointment/AppointmentCard.tsx"
New-File "components/appointment/AppointmentTable.tsx"

# ── COMPONENTS / CHATBOT ─────────────────────────────────────
New-Dir "components/chatbot"
New-File "components/chatbot/ChatbotWidget.tsx"
New-File "components/chatbot/ChatMessage.tsx"
New-File "components/chatbot/ChatInput.tsx"
New-File "components/chatbot/TypingIndicator.tsx"

# ── COMPONENTS / DASHBOARD ───────────────────────────────────
New-Dir "components/dashboard"
New-File "components/dashboard/StatsCard.tsx"
New-File "components/dashboard/RecentAppointments.tsx"
New-File "components/dashboard/PatientTable.tsx"
New-File "components/dashboard/DoctorTable.tsx"
New-File "components/dashboard/BillingTable.tsx"
New-File "components/dashboard/RevenueChart.tsx"
New-File "components/dashboard/AppointmentChart.tsx"
New-File "components/dashboard/NotificationPanel.tsx"
New-File "components/dashboard/ActivityFeed.tsx"

# ── COMPONENTS / FORMS ───────────────────────────────────────
New-Dir "components/forms"
New-File "components/forms/PatientForm.tsx"
New-File "components/forms/DoctorForm.tsx"
New-File "components/forms/BillingForm.tsx"
New-File "components/forms/MedicalRecordForm.tsx"
New-File "components/forms/UserForm.tsx"
New-File "components/forms/ClinicSettingsForm.tsx"

# ── LIB ──────────────────────────────────────────────────────
New-Dir "lib"
New-File "lib/mongodb.ts"
New-File "lib/auth.ts"
New-File "lib/groq.ts"
New-File "lib/rag.ts"
New-File "lib/utils.ts"
New-File "lib/validations.ts"
New-File "lib/constants.ts"
New-File "lib/email.ts"

# ── MODELS ───────────────────────────────────────────────────
New-Dir "models"
New-File "models/User.ts"
New-File "models/Patient.ts"
New-File "models/Doctor.ts"
New-File "models/Appointment.ts"
New-File "models/Billing.ts"
New-File "models/MedicalRecord.ts"
New-File "models/Notification.ts"
New-File "models/Clinic.ts"

# ── HOOKS ────────────────────────────────────────────────────
New-Dir "hooks"
New-File "hooks/useAuth.ts"
New-File "hooks/useAppointments.ts"
New-File "hooks/useNotifications.ts"
New-File "hooks/usePatients.ts"
New-File "hooks/useDoctors.ts"
New-File "hooks/useBilling.ts"

# ── TYPES ────────────────────────────────────────────────────
New-Dir "types"
New-File "types/index.ts"
New-File "types/next-auth.d.ts"

# ── PUBLIC ASSETS ────────────────────────────────────────────
New-Dir "public/images"
New-Dir "public/icons"

# ── ROOT CONFIG FILES ────────────────────────────────────────
New-File "middleware.ts"
New-File "next.config.js"
New-File "tailwind.config.js"
New-File "postcss.config.js"
New-File "tsconfig.json"
New-File "package.json"
New-File ".env.local" @"
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/dental_clinic?retryWrites=true&w=majority
NEXTAUTH_SECRET=your_super_secret_key_here_min_32_chars
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key_here
"@
New-File ".gitignore" @"
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
"@
New-File "README.md" @"
# DentalCare Dental Clinic

A full-stack dental clinic management system built with Next.js 14, MongoDB, Groq AI, and Tailwind CSS.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas (free tier)
- **Auth**: NextAuth.js
- **AI Chatbot**: Groq API (llama3-8b-8192)
- **Deployment**: Vercel (free tier)

## Getting Started

### 1. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Set up environment variables
Edit \`.env.local\` with your credentials.

### 3. Run development server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Free Platforms Used
| Service | Platform |
|---------|----------|
| Database | MongoDB Atlas (512MB free) |
| Auth | NextAuth.js (open source) |
| AI/LLM | Groq API (free tier) |
| Hosting | Vercel (free hobby tier) |
"@

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. cd into your project folder" -ForegroundColor Gray
Write-Host "  2. Run: npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir no --import-alias '@/*'" -ForegroundColor Gray
Write-Host "     (when asked to overwrite, say NO for config files)" -ForegroundColor Gray
Write-Host "  3. Run: npm install next-auth mongoose bcryptjs groq-sdk react-hot-toast react-hook-form date-fns react-icons recharts @types/bcryptjs" -ForegroundColor Gray
Write-Host "  4. Fill in .env.local with your credentials" -ForegroundColor Gray
Write-Host "  5. Paste source code into each file from the guide" -ForegroundColor Gray
Write-Host "  6. Run: npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  MongoDB Atlas  : https://cloud.mongodb.com  (free 512MB)" -ForegroundColor DarkCyan
Write-Host "  Groq API Key   : https://console.groq.com   (free tier)"  -ForegroundColor DarkCyan
Write-Host "  Deploy (Vercel): https://vercel.com         (free hobby)" -ForegroundColor DarkCyan
Write-Host ""