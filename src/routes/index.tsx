import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({ meta: [
    { title: "Azwaj — Marriage, with purpose." },
    { name: "description", content: "A private, wali-mediated Muslim marriage introduction platform for the Sri Lankan Muslim community." },
  ] }),
});

function Mark({ className = "" }: { className?: string }) {
  return <img src="/azwaj-symbol.svg" alt="" aria-hidden="true" className={className} />;
}
function Arrow() {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-[15px] w-[15px]"><path d="M5 15 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function Shield() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="w-[25px]"><path d="M16 3.5 26 7v8.2c0 6.2-4.2 10.7-10 13.3-5.8-2.6-10-7.1-10-13.3V7l10-3.5Z" stroke="currentColor" strokeWidth="1.4"/><path d="m11.5 15.8 3 3 6-6.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Family() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="w-[25px]"><circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="1.4"/><circle cx="23" cy="12" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M4.5 26v-2.2a7.5 7.5 0 0 1 15 0V26M19 19.5a5.2 5.2 0 0 1 8.5 4V26" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
const eyebrow = "flex items-center gap-2.5 text-[9px] font-semibold uppercase tracking-[.17em] text-[#88724f]";
const heading = "font-serif font-normal leading-[.92] tracking-[-.055em] text-[#3f3329]";
const button = "inline-flex min-h-[49px] items-center justify-center gap-[17px] bg-[#594638] px-5 text-[10px] font-semibold text-[#fffaf1] transition hover:-translate-y-0.5 hover:bg-[#403329]";
const quietLink = "inline-flex items-center gap-2.5 text-[11px] font-semibold text-[#594638]";
const wrap = "mx-auto w-full max-w-[1220px] px-[22px] sm:px-[34px]";

function Home() {
  return <main className="overflow-hidden bg-[#f7f2e9] text-[#292722]">
    <div className="flex h-[34px] items-center justify-center gap-[9px] bg-[#594638] text-[8px] uppercase tracking-[.08em] text-[#f5eddf] sm:text-[10px] sm:tracking-[.12em]"><i className="h-[5px] w-[5px] rounded-full bg-[#c3a36a]"/>Made for the Sri Lankan Muslim community</div>
    <header className="mx-auto flex h-[70px] max-w-[1220px] items-center justify-between px-[21px] sm:h-[82px] sm:px-[34px]">
      <a className="flex items-center gap-2.5 font-serif text-[29px] font-semibold tracking-[-.04em] text-[#594638] sm:text-[32px]" href="#top" aria-label="Azwaj home"><Mark className="h-9 w-8 object-contain sm:h-[42px] sm:w-[38px]"/><span>azwaj</span></a>
      <nav className="ml-20 hidden gap-[37px] text-[11px] text-[#6d655a] md:flex"><a href="#approach">Our approach</a><a href="#how-it-works">How it works</a><a href="#privacy">Privacy</a></nav>
      <a className="flex items-center gap-2 text-[10px] font-semibold text-[#594638] sm:text-[11px]" href="#how-it-works">Discover Azwaj <Arrow/></a>
    </header>

    <section id="top" className={wrap + " grid gap-[22px] pb-[55px] pt-[45px] sm:gap-10 sm:pb-[65px] sm:pt-[35px] md:min-h-[620px] md:grid-cols-[1fr_.92fr] md:items-center"}>
      <div className="relative z-10 md:pl-[4.5%]">
        <div className={eyebrow}><i className="h-px w-[23px] bg-[#c3a36a]"/>A more considered way to meet</div>
        <h1 className="mt-[25px] mb-[19px] font-serif text-[clamp(68px,16vw,88px)] leading-[.84] tracking-[-.055em] text-[#3f3329] sm:text-[clamp(64px,7.5vw,96px)]">Marriage,<br/><em className="font-normal text-[#9b835f]">with purpose.</em></h1>
        <p className="max-w-[460px] text-[12px] leading-[1.95] text-[#71695e] sm:text-[13px]">A respectful space for Muslims and their families to take the first step towards marriage — with privacy, clarity and the involvement of a wali.</p>
        <div className="mt-[31px] flex flex-wrap items-center gap-7"><a className={button} href="#how-it-works">Discover how it works <Arrow/></a><a className={quietLink} href="#approach">Our approach <b className="text-[17px]">→</b></a></div>
        <div className="mt-[31px] flex items-center gap-3 text-[10px] leading-[1.7] text-[#847b6e] sm:mt-[49px]"><span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border border-[#d8c9ad] text-[#8d7958]"><Shield/></span><p><strong className="text-[#51463a]">Introductions, not dating.</strong><br/>Built around family involvement and respectful boundaries.</p></div>
      </div>
      <div className="relative grid min-h-[390px] place-items-center md:min-h-[470px]">
        <div className="absolute h-[360px] w-[360px] rounded-full border border-[#a3916f30] sm:h-[470px] sm:w-[470px]"/><div className="absolute h-[400px] w-[400px] rounded-full border border-dashed border-[#a3916f21] sm:h-[520px] sm:w-[520px]"/>
        <div className="relative z-[1] flex min-h-[360px] w-[88%] max-w-[430px] flex-col items-center justify-between border border-[#e5d8c2] bg-[#f3eadb] px-[29px] py-[21px] shadow-[0_24px_70px_#49382617] sm:min-h-[430px]">
          <div className="pointer-events-none absolute inset-[11px] border border-[#997e5230] after:absolute after:inset-[5px] after:border after:border-[#997e521a] after:content-['']"/>
          <div className="z-[1] flex w-full items-center justify-between text-[8px] tracking-[.13em] text-[#9a835f]"><span className="font-arabic text-xl">أزواج</span><small>EST. WITH INTENTION</small></div>
          <Mark className="z-[1] max-h-[250px] w-[75%] object-contain sm:max-h-[300px] sm:w-[77%]"/>
          <div className="z-[1] font-serif text-sm italic text-[#88785f]">— &nbsp; Two lives. One meaningful beginning. &nbsp; —</div>
        </div>
        <span className="absolute top-[22px] right-[34px] text-[25px] text-[#ad9365]">✳</span>
        <span className="absolute top-[85px] left-0 z-[2] -rotate-[7deg] border border-[#e4d9c6] bg-[#fbf7ee] px-[13px] py-2 font-serif text-sm italic text-[#88785f] shadow-lg sm:top-[108px]">Trust</span>
        <span className="absolute right-0 bottom-[70px] z-[2] rotate-[6deg] border border-[#e4d9c6] bg-[#fbf7ee] px-[13px] py-2 font-serif text-sm italic text-[#88785f] shadow-lg sm:bottom-[104px]">Respect</span>
      </div>
    </section>

    <section id="approach" className="border-y border-[#e1d5c1] bg-[#eae0cf]"><div className={wrap + " relative py-[22px] sm:flex sm:min-h-[120px] sm:items-center sm:gap-[45px] sm:py-[25px]"}><small className="text-[8px] font-semibold tracking-[.17em] text-[#8c7653]">THE AZWAJ APPROACH</small><p className="mt-2 font-serif text-[25px] leading-[1.1] text-[#57483a] sm:mt-0 sm:text-[clamp(22px,3vw,31px)]">A purposeful introduction, guided by <em className="text-[#8d7958]">faith, family and respect.</em></p><span className="absolute right-[17px] bottom-[10px] text-[31px] text-[#937b5361] sm:static sm:ml-auto sm:text-[45px]">✳</span></div></section>

    <section className={wrap + " py-[78px] sm:py-[112px]"}><div className="max-w-[560px]"><div className={eyebrow}>A different kind of platform</div><h2 className={heading + " mt-5 mb-[17px] text-[55px] sm:text-[clamp(48px,5.3vw,66px)]"}>Designed around what<br/><em className="text-[#9b835f]">matters most.</em></h2><p className="max-w-[460px] text-xs leading-[1.9] text-[#797165]">Finding a spouse is an important decision. The process deserves care, dignity and thoughtful boundaries.</p></div>
      <div className="mt-[35px] grid grid-cols-1 gap-[11px] sm:mt-[52px] md:grid-cols-3 md:gap-4">
        <article className="min-h-[250px] border border-[#e8dfd0] bg-[#fbf8f1b3] p-[22px] sm:p-[26px]"><span className="grid h-[43px] w-[43px] place-items-center rounded-full border border-[#dfd2bb] text-[#907b59]"><Shield/></span><small className="mt-[25px] block text-[8px] font-semibold tracking-[.15em] text-[#a18a63]">01 / PRIVACY</small><h3 className="mt-2 mb-2 font-serif text-2xl font-medium text-[#514235]">Privacy by intention</h3><p className="text-[10px] leading-[1.85] text-[#7c7468]">Sisters' profiles are never publicly listed. Personal details are handled with care and shared only through the agreed introduction process.</p></article>
        <article className="min-h-[250px] border border-[#e8dfd0] bg-[#fbf8f1b3] p-[22px] sm:p-[26px]"><span className="grid h-[43px] w-[43px] place-items-center rounded-full border border-[#dfd2bb] text-[#907b59]"><Family/></span><small className="mt-[25px] block text-[8px] font-semibold tracking-[.15em] text-[#a18a63]">02 / FAMILY</small><h3 className="mt-2 mb-2 font-serif text-2xl font-medium text-[#514235]">Wali involvement</h3><p className="text-[10px] leading-[1.85] text-[#7c7468]">Introductions are designed to involve a wali, helping families take an active and meaningful part from the very beginning.</p></article>
        <article className="min-h-[250px] border border-[#e8dfd0] bg-[#fbf8f1b3] p-[22px] sm:p-[26px]"><span className="grid h-[43px] w-[43px] place-items-center rounded-full border border-[#dfd2bb] text-[25px] text-[#907b59]">↗</span><small className="mt-[25px] block text-[8px] font-semibold tracking-[.15em] text-[#a18a63]">03 / RESPECT</small><h3 className="mt-2 mb-2 font-serif text-2xl font-medium text-[#514235]">Clear boundaries</h3><p className="text-[10px] leading-[1.85] text-[#7c7468]">No dating culture or private in-app courtship. Azwaj focuses on purposeful introductions and helping families arrange the next step.</p></article>
      </div>
    </section>

    <section id="how-it-works" className="border-y border-[#e4d8c6] bg-[#eee5d7]"><div className={wrap + " grid gap-[35px] py-[78px] sm:gap-[55px] sm:py-[104px] md:grid-cols-[.8fr_1.2fr] md:gap-[100px]"}><div><div className={eyebrow}>A simple, considered process</div><h2 className={heading + " mt-5 mb-[17px] text-[55px]"}>From discovery<br/>to <em className="text-[#9b835f]">introduction.</em></h2><p className="max-w-[460px] text-xs leading-[1.9] text-[#797165]">Azwaj keeps the process straightforward. The platform helps make an introduction; families take it forward.</p></div>
      <div className="border-t border-[#d8cbb7]">{[
        ["01","Verified brothers create a profile","Brothers submit their details for review before a profile is made available to eligible users."],
        ["02","Sisters and walis explore profiles","Browse available brother profiles privately and consider compatibility at your own pace."],
        ["03","A wali requests an introduction","When there is interest, the wali sends a request to the brother through Azwaj."],
        ["04","Families connect","If the brother agrees, his contact details are shared with the wali so the families can arrange a meeting."]
      ].map(([n,title,desc])=><article key={n} className="grid grid-cols-[36px_1fr] gap-3 border-b border-[#d8cbb7] py-[25px] sm:grid-cols-[50px_1fr] sm:gap-[19px] sm:pb-[27px]"><b className="pt-1.5 font-serif text-[19px] text-[#a38b62]">{n}</b><div><h3 className="mb-2 font-serif text-[25px] font-medium text-[#514235]">{title}</h3><p className="max-w-[410px] text-[11px] leading-[1.85] text-[#7c7468]">{desc}</p></div></article>)}</div>
    </div></section>

    <section id="privacy" className={wrap + " grid grid-cols-1 py-[65px] sm:py-[105px] md:grid-cols-[1fr_.8fr]"}><div className="min-h-[410px] bg-[#594638] px-[25px] py-[43px] text-[#f8f0e3] sm:px-[40px] sm:py-[65px] md:pl-[65px]"><div className={eyebrow + " text-[#d0b889]"}>A principle, not a feature</div><h2 className="mt-5 mb-[17px] font-serif text-[55px] leading-[.92] tracking-[-.055em] text-[#fbf3e6]">Some things are<br/><em className="text-[#d0b889]">kept private.</em></h2><p className="max-w-[460px] text-xs leading-[1.9] text-[#d2c5b3]">Azwaj is designed so that sisters do not appear in a public directory. The introduction process begins with a brother's profile and a wali-led request — not an open exchange of personal details.</p><a className={quietLink + " mt-[15px] text-[#e3c997]"} href="#how-it-works">Understand the process <b className="text-[17px]">→</b></a></div>
      <div className="relative grid min-h-[320px] place-items-center bg-[#4b3c30] sm:min-h-[410px]"><div className="relative flex h-[235px] w-[180px] flex-col items-center justify-center gap-[23px] rounded-t-[100px] border border-[#d3b8877a] sm:h-[270px] sm:w-[210px] sm:rounded-t-[110px] before:absolute before:inset-[10px] before:rounded-t-[90px] before:border before:border-[#d3b8872e]"><span className="text-[25px] text-[#d0b889]">✳</span><div className="grid h-[68px] w-[68px] place-items-center rounded-full border border-[#d3b8878c] text-[#e2c994]"><Shield/></div><small className="text-[8px] tracking-[.2em] text-[#d9c39b]">PRIVATE BY DESIGN</small></div><label className="absolute right-[22px] bottom-5 text-[7px] tracking-[.16em] text-[#e7d7bc8c] [writing-mode:vertical-rl]">RESPECT · TRUST · AMANAH</label></div>
    </section>

    <section className={wrap + " flex flex-col items-center px-5 pt-[45px] pb-[70px] text-center sm:pt-[65px] sm:pb-[95px]"}><Mark className="mb-[25px] h-[59px] w-[54px] object-contain"/><div className={eyebrow}>A meaningful beginning</div><h2 className={heading + " mt-[19px] mb-4 text-[clamp(52px,6vw,72px)]"}>Take the first step<br/><em className="text-[#9b835f]">with intention.</em></h2><p className="mb-[25px] text-[11px] text-[#7b7368]">Azwaj is being created for the Sri Lankan Muslim community.</p><a className={button} href="#top">Back to the beginning <Arrow/></a></section>
    <footer className="flex min-h-[92px] flex-wrap items-center justify-between gap-3 border-t border-[#e4dacb] bg-[#f1eadd] px-[22px] py-5 sm:px-[max(34px,calc((100vw-1152px)/2))]"><a className="flex items-center gap-2.5 font-serif text-[26px] font-semibold tracking-[-.04em] text-[#594638]" href="#top"><Mark className="h-8 w-[29px] object-contain"/><span>azwaj</span></a><i className="hidden font-serif text-[15px] italic text-[#8c806e] sm:block">Marriage, with purpose.</i><small className="text-[9px] text-[#928879]">© {new Date().getFullYear()} Azwaj. Made with care.</small></footer>
  </main>;
}
