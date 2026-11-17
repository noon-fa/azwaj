export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-wide text-[#9A7B3E]">Privacy Policy</p>
        <h1 className="font-serif text-4xl font-semibold text-[#1A2421]">
          Responsible data stewardship &amp; confidentiality
        </h1>
        <p className="text-xs text-[#7B8682]">Effective Date: November 2026 · Azwaj Sri Lanka</p>
      </header>

      <div className="space-y-6 text-sm leading-relaxed text-[#54615C]">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#1A2421]">1. Minimal Data Collection</h2>
          <p>
            Azwaj collects only information strictly necessary to facilitate wali-mediated
            marriage introductions and scholarly marriage counselling. We never sell personal data
            or use counselling details for marketing.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#1A2421]">2. Public Directory Isolation</h2>
          <p>
            Public brother profiles display only approved, consented non-contact attributes (display
            name, birth year/age, district, education, occupation, languages, and preferences).
            Email addresses, phone numbers, exact dates of birth, and administrative notes are
            stored in an isolated private collection inaccessible to public visitors.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#1A2421]">3. Sister &amp; Wali Information</h2>
          <p>
            Information submitted by a sister’s wali is never published publicly. It is accessible
            exclusively to the selected brother (for his 7-day evaluation) and authorized Azwaj
            moderation staff.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#1A2421]">4. Counselling Confidentiality</h2>
          <p>
            Counselling bookings and session notes are stored in completely separate collections
            from marriage records. Only the assigned scholar and authorized operational staff may
            access necessary booking details.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#1A2421]">5. Verification Honesty</h2>
          <p>
            Email verification confirms access to an email mailbox only. Azwaj does not claim
            government-issued identity verification or legal verification of wali guardianship
            solely on the basis of email sign-in. Families remain responsible for conducting proper
            due diligence offline.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#1A2421]">6. Account Deletion</h2>
          <p>
            Registered brothers may unpublish their profile at any time or request account deletion
            directly from Dashboard Settings.
          </p>
        </section>
      </div>
    </div>
  );
}
