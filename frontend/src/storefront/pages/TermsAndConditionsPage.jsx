export default function TermsAndConditionsPage() {
  const sections = [
    {
      title: "1. About These Terms",
      content: (
        <>
          <p>
            Welcome to ASH Jewellery. These Terms and Conditions explain the
            rules for using our website — browsing our jewellery collections,
            creating an account, saving items to your wishlist, and sending us
            enquiries about our products.
          </p>
          <p>
            By using this website, you're agreeing to these Terms. If something
            here doesn't sit right with you, please don't continue using the
            site — and feel free to reach out to us with any questions before
            you do.
          </p>
        </>
      ),
    },

    {
      title: "2. A Few Definitions",
      content: (
        <ul>
          <li>
            <strong>"ASH Jewellery," "we," "us," or "our"</strong> refers to
            Aakansha Silver House Private Limited, the company behind this
            website.
          </li>
          <li>
            <strong>"You" or "customer"</strong> means anyone browsing or using
            this website.
          </li>
          <li>
            <strong>"Product"</strong> means any jewellery item listed in our
            online catalogue.
          </li>
          <li>
            <strong>"Enquiry"</strong> means a message you send us asking about
            a product or service.
          </li>
          <li>
            <strong>"Content"</strong> means everything on the site — photos,
            text, logos, videos, product details, and so on.
          </li>
        </ul>
      ),
    },

    {
      title: "3. Who Can Use This Site",
      content: (
        <p>
          You should be at least 18 years old, or using the site with a parent
          or guardian's involvement, to submit enquiries or create an account
          with us. Whatever information you give us — your name, contact
          details, and so on — we ask that it's accurate and up to date.
        </p>
      ),
    },

    {
      title: "4. How We Expect You to Use the Site",
      content: (
        <>
          <p>
            We want this to be a safe, pleasant space for everyone. So please
            don't:
          </p>
          <ul>
            <li>Try to break into our systems, servers, or databases;</li>
            <li>
              Upload viruses, malware, or anything designed to cause harm;
            </li>
            <li>
              Use bots or scrapers to pull data from the site without asking us
              first;
            </li>
            <li>
              Send us false or misleading enquiries, or pretend to be someone
              you're not;
            </li>
            <li>
              Copy or reuse our content — photos, product write-ups, branding —
              for your own commercial purposes without our permission; or
            </li>
            <li>
              Use the site in any way that could interfere with how it works for
              other people.
            </li>
          </ul>
          <p>
            If we notice any of this happening, we may restrict or suspend
            access to protect the site and our other customers.
          </p>
        </>
      ),
    },

    {
      title: "5. Your Account",
      content: (
        <p>
          If you create an account with us, please keep your login details
          private and let us know right away if you think someone else has
          gotten hold of them. You're responsible for what happens under your
          account, except in cases where access was gained without your
          knowledge or fault. If we ever notice suspicious activity, fraud, or a
          clear violation of these Terms, we may need to suspend or close the
          account — we'll always try to do this fairly and in line with the law.
        </p>
      ),
    },

    {
      title: "6. Our Product Catalogue",
      content: (
        <>
          <p>
            We do our best to keep product names, descriptions, images, and
            availability accurate — but with a catalogue this size, the
            occasional error or outdated detail can slip through. If you spot
            something that looks off, we'd genuinely appreciate you letting us
            know.
          </p>
          <p>
            Jewellery can also look a little different depending on your screen,
            its brightness, or the lighting in the photo — so colours and
            finishes may vary slightly from the actual piece. We may also
            update, discontinue, or remove products from the catalogue at any
            time.
          </p>
        </>
      ),
    },

    {
      title: "7. Product Availability",
      content: (
        <p>
          A product being listed on our website doesn't guarantee it'll still be
          available by the time you enquire about it or decide to purchase it.
          Jewellery pieces — especially handcrafted or limited designs — can
          sell out or be discontinued without much notice. We'll always let you
          know if something you've enquired about is no longer available.
        </p>
      ),
    },

    {
      title: "8. Pricing",
      content: (
        <>
          <p>
            Prices shown on the site can change — this is fairly normal in
            jewellery, since silver, gemstone, and making-charge costs shift
            over time. Any price you see while browsing should be treated as
            indicative until we confirm it with you directly.
          </p>
          <p>
            The final price — including taxes, making charges, and any delivery
            costs — will always be confirmed with you before any purchase goes
            ahead.
          </p>
        </>
      ),
    },

    {
      title: "9. Sending Us an Enquiry",
      content: (
        <p>
          When you submit an enquiry through our website, you're simply asking
          us for more information — it isn't the same as placing an order or
          reserving a product. Once we receive your enquiry, we'll use the
          details you've shared to respond to you, answer your questions, and
          help you with pricing or availability. We may also contact you back
          using the details you provided.
        </p>
      ),
    },

    {
      title: "10. Chatting With Us on WhatsApp",
      content: (
        <p>
          After you send an enquiry, we may redirect you to WhatsApp with a
          message already filled in, so you can continue the conversation with
          us there. WhatsApp is run by a separate company (Meta) and has its own
          terms and privacy practices — we don't control how it works. Before
          hitting send, it's worth taking a quick look at the pre-filled message
          to make sure everything looks right.
        </p>
      ),
    },

    {
      title: "11. Your Wishlist",
      content: (
        <p>
          If you've created an account, you can save products to your wishlist
          to come back to later. Keep in mind this is just a personal shortlist
          — it doesn't reserve the item, lock in its price, or guarantee it'll
          still be available when you return to it.
        </p>
      ),
    },

    {
      title: "12. Information You Share With Us",
      content: (
        <>
          <p>
            When you fill out a form on our site — whether it's for an account,
            an enquiry, or anything else — we ask that the information is
            accurate and genuinely yours to share. Please don't submit anything
            that's:
          </p>
          <ul>
            <li>False or intended to mislead us;</li>
            <li>Offensive, threatening, or unlawful;</li>
            <li>Carrying malware or harmful code; or</li>
            <li>
              Something you don't have the right to share, such as another
              person's private details.
            </li>
          </ul>
        </>
      ),
    },

    {
      title: "13. Our Content and Intellectual Property",
      content: (
        <p>
          Everything you see on this site — our name, logo, product photography,
          descriptions, designs, and the site itself — belongs to ASH Jewellery
          or is used with permission. You're welcome to browse and enjoy it, but
          please don't copy, reproduce, or use it commercially without asking us
          first.
        </p>
      ),
    },

    {
      title: "14. Your Privacy",
      content: (
        <p>
          Using our site means sharing some personal information with us — for
          your account, enquiries, or general support. We take this seriously,
          and how we handle it is explained fully in our Privacy Policy, which
          works alongside these Terms.
        </p>
      ),
    },

    {
      title: "15. Other Websites and Services We Link To",
      content: (
        <p>
          Our site may occasionally link out to other services — WhatsApp being
          the main one, but there could be others down the line (analytics
          tools, social platforms, etc.). Those services run on their own terms,
          and we're not responsible for what happens once you leave our site.
        </p>
      ),
    },

    {
      title: "16. Keeping the Site Running",
      content: (
        <p>
          We do our best to keep the website up and running smoothly, but from
          time to time it may be temporarily unavailable — for maintenance,
          technical issues, or things outside our control. We may also update,
          add, or remove features on the site as we continue to improve it.
        </p>
      ),
    },

    {
      title: "17. A Quick Disclaimer",
      content: (
        <p>
          Everything on this site is provided to help you learn about our
          jewellery and get in touch with us. While we try hard to keep things
          accurate and current, we can't promise the site will always be
          error-free. Nothing here is meant to take away any legal rights you're
          entitled to as a consumer.
        </p>
      ),
    },

    {
      title: "18. Limits on Our Responsibility",
      content: (
        <p>
          To the extent the law allows, ASH Jewellery won't be held responsible
          for issues caused by things beyond our reasonable control — like
          temporary site downtime, third-party service outages (such as
          WhatsApp), or internet connectivity issues. This doesn't affect any
          rights you have that can't legally be limited.
        </p>
      ),
    },

    {
      title: "19. If Something Goes Wrong Because of Misuse",
      content: (
        <p>
          If you use the site unlawfully, break these Terms, or infringe on
          someone else's rights, you agree to take responsibility for any
          reasonable losses or costs that result — to the extent permitted by
          law.
        </p>
      ),
    },

    {
      title: "20. Suspending or Closing Access",
      content: (
        <p>
          In situations involving fraud, security concerns, or a serious breach
          of these Terms, we may need to suspend or close your access to the
          site or your account. Anything that happened before that point — like
          an ongoing enquiry — will still be honoured.
        </p>
      ),
    },

    {
      title: "21. Updates to These Terms",
      content: (
        <p>
          We may update these Terms occasionally as our website, services, or
          applicable laws evolve. Whenever we do, we'll publish the updated
          version here with a new date. Continuing to use the site after an
          update means you're accepting the revised Terms.
        </p>
      ),
    },

    {
      title: "22. If One Part of These Terms Doesn't Hold Up",
      content: (
        <p>
          If any part of these Terms is found to be invalid or unenforceable by
          a court, that particular part will be adjusted to the minimum extent
          necessary — the rest of the Terms will continue to apply as normal.
        </p>
      ),
    },

    {
      title: "23. Governing Law",
      content: (
        <p>
          These Terms are governed by the laws of India. Any disputes that can't
          be resolved directly with us will fall under the jurisdiction of the
          courts in Uttarakhand, where our business is registered — without
          limiting any consumer rights you're entitled to under Indian law.
        </p>
      ),
    },

    {
      title: "24. Questions, Concerns, or Complaints",
      content: (
        <>
          <p>
            If you have a question about your enquiry, a product, or these
            Terms, we're happy to help — reach out any time using the details
            below. For formal complaints, our team will acknowledge your message
            promptly and work to resolve it as quickly as possible.
          </p>
          <div className="terms-contact">
            <p>
              <strong>Customer Support Email:</strong> ashsterling925@gmail.com
            </p>
            <p>
              <strong>WhatsApp / Sales Enquiries:</strong> +91 70880 55010
            </p>
            <p>
              <strong>General / Official Contact:</strong> +91 82188 51894
            </p>
            <p>
              <strong>Business Address:</strong> House No. 2, Pushpak Vihar
              Colony, Gange Baba Gurudwara Road, Kashipur, Uttarakhand – 244713
            </p>
          </div>
        </>
      ),
    },

    {
      title: "25. Company Information",
      content: (
        <div className="terms-contact">
          <p>
            <strong>ASH Jewellery</strong>
          </p>
          <p>
            <strong>Legal Entity:</strong> Aakansha Silver House Private Limited
          </p>
          <p>
            <strong>Registered Address:</strong> House No. 2, Pushpak Vihar
            Colony, Gange Baba Gurudwara Road, Kashipur, Uttarakhand – 244713
          </p>
          <p>
            <strong>Email:</strong> ashsterling925@gmail.com
          </p>
          <p>
            <strong>Website:</strong> www.ashforsilver.in
          </p>
        </div>
      ),
    },
  ];

  return (
    <main className="terms-page">
      <section className="terms-hero">
        <div className="container">
          <p className="terms-eyebrow">ASH JEWELLERY</p>
          <h1>Terms &amp; Conditions</h1>
          <p className="terms-intro">
            Please take a moment to read through these before using our website.
          </p>
        </div>
      </section>

      <section className="terms-content">
        <div className="container">
          <div className="terms-meta">
          </div>

          <article className="terms-article">
            {sections.map((section) => (
              <section key={section.title} className="terms-section">
                <h2>{section.title}</h2>
                <div className="terms-section-content">{section.content}</div>
              </section>
            ))}
          </article>
        </div>
      </section>
    </main>
  );
}
