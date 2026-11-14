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
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 15 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function Shield() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 3.5 26 7v8.2c0 6.2-4.2 10.7-10 13.3-5.8-2.6-10-7.1-10-13.3V7l10-3.5Z" stroke="currentColor" strokeWidth="1.4"/><path d="m11.5 15.8 3 3 6-6.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Family() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="1.4"/><circle cx="23" cy="12" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M4.5 26v-2.2a7.5 7.5 0 0 1 15 0V26M19 19.5a5.2 5.2 0 0 1 8.5 4V26" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function Home() {
  return <main>
    <div className="announcement"><i/>Made for the Sri Lankan Muslim community</div>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Azwaj home"><Mark className="brand-mark"/><span>azwaj</span></a>
      <nav><a href="#approach">Our approach</a><a href="#how-it-works">How it works</a><a href="#privacy">Privacy</a></nav>
      <a className="header-link" href="#how-it-works">Discover Azwaj <Arrow/></a>
    </header>
    <section className="hero wrap" id="top">
      <div className="hero-copy">
        <div className="eyebrow"><i/>A more considered way to meet</div>
        <h1>Marriage,<br/><em>with purpose.</em></h1>
        <p className="lead">A respectful space for Muslims and their families to take the first step towards marriage — with privacy, clarity and the involvement of a wali.</p>
        <div className="actions"><a className="button" href="#how-it-works">Discover how it works <Arrow/></a><a className="quiet-link" href="#approach">Our approach <b>→</b></a></div>
        <div className="note"><span><Shield/></span><p><strong>Introductions, not dating.</strong><br/>Built around family involvement and respectful boundaries.</p></div>
      </div>
      <div className="hero-art">
        <div className="orbit orbit-a"/><div className="orbit orbit-b"/>
        <div className="art-card"><div className="art-top"><span>أزواج</span><small>EST. WITH INTENTION</small></div><Mark className="hero-mark"/><div className="art-caption">— &nbsp; Two lives. One meaningful beginning. &nbsp; —</div></div>
        <span className="float-label label-a">Trust</span><span className="float-label label-b">Respect</span><span className="spark">✳</span>
      </div>
    </section>
    <section className="statement" id="approach"><div className="statement-inner"><small>THE AZWAJ APPROACH</small><p>A purposeful introduction, guided by <em>faith, family and respect.</em></p><span>✳</span></div></section>
    <section className="principles wrap">
      <div className="section-heading"><div className="eyebrow">A different kind of platform</div><h2>Designed around what<br/><em>matters most.</em></h2><p>Finding a spouse is an important decision. The process deserves care, dignity and thoughtful boundaries.</p></div>
      <div className="cards">
        <article><span className="icon"><Shield/></span><small>01 / PRIVACY</small><h3>Privacy by intention</h3><p>Sisters' profiles are never publicly listed. Personal details are handled with care and shared only through the agreed introduction process.</p></article>
        <article><span className="icon"><Family/></span><small>02 / FAMILY</small><h3>Wali involvement</h3><p>Introductions are designed to involve a wali, helping families take an active and meaningful part from the very beginning.</p></article>
        <article><span className="icon"><span className="handshake">↗</span></span><small>03 / RESPECT</small><h3>Clear boundaries</h3><p>No dating culture or private in-app courtship. Azwaj focuses on purposeful introductions and helping families arrange the next step.</p></article>
      </div>
    </section>
    <section className="process" id="how-it-works"><div className="wrap process-inner">
      <div className="section-heading"><div className="eyebrow">A simple, considered process</div><h2>From discovery<br/>to <em>introduction.</em></h2><p>Azwaj keeps the process straightforward. The platform helps make an introduction; families take it forward.</p></div>
      <div className="steps">
        <article><b>01</b><div><h3>Verified brothers create a profile</h3><p>Brothers submit their details for review before a profile is made available to eligible users.</p></div></article>
        <article><b>02</b><div><h3>Sisters and walis explore profiles</h3><p>Browse available brother profiles privately and consider compatibility at your own pace.</p></div></article>
        <article><b>03</b><div><h3>A wali requests an introduction</h3><p>When there is interest, the wali sends a request to the brother through Azwaj.</p></div></article>
        <article><b>04</b><div><h3>Families connect</h3><p>If the brother agrees, his contact details are shared with the wali so the families can arrange a meeting.</p></div></article>
      </div>
    </div></section>
    <section className="privacy wrap" id="privacy"><div className="privacy-copy"><div className="eyebrow">A principle, not a feature</div><h2>Some things are<br/><em>kept private.</em></h2><p>Azwaj is designed so that sisters do not appear in a public directory. The introduction process begins with a brother's profile and a wali-led request — not an open exchange of personal details.</p><a className="quiet-link" href="#how-it-works">Understand the process <b>→</b></a></div><div className="privacy-art"><div className="arch"><span>✳</span><div><Shield/></div><small>PRIVATE BY DESIGN</small></div><label>RESPECT · TRUST · AMANAH</label></div></section>
    <section className="closing wrap"><Mark className="closing-mark"/><div className="eyebrow">A meaningful beginning</div><h2>Take the first step<br/><em>with intention.</em></h2><p>Azwaj is being created for the Sri Lankan Muslim community.</p><a className="button" href="#top">Back to the beginning <Arrow/></a></section>
    <footer><a className="brand" href="#top"><Mark className="brand-mark"/><span>azwaj</span></a><i>Marriage, with purpose.</i><small>© {new Date().getFullYear()} Azwaj. Made with care.</small></footer>
  </main>;
}
