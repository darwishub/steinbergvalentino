#!/usr/bin/env python3
"""
SteinbergValentino Content Migration Repair Script v2
Reads scraped HTML → extracts correct section content → pushes to Strapi API
"""

import re, sys, json, time
import urllib.request, urllib.parse, urllib.error
from bs4 import BeautifulSoup

STRAPI_URL = "http://127.0.0.1:1337"
TOKEN      = "REDACTED_TOKEN"
HTML_DIR   = "/Users/darwis/steinbergvalentino.com"
HEADERS    = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

# ─── Strapi helpers ──────────────────────────────────────────────────────────
def api_get(path):
    req = urllib.request.Request(f"{STRAPI_URL}{path}", headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except Exception as e:
        print(f"  GET {path} FAILED: {e}"); return None

def api_put(path, data):
    body = json.dumps({"data": data}).encode()
    req  = urllib.request.Request(f"{STRAPI_URL}{path}", data=body, headers=HEADERS, method="PUT")
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        print(f"  PUT HTTP {e.code}: {e.read().decode()[:300]}"); return None
    except Exception as e:
        print(f"  PUT FAILED: {e}"); return None

def rich(text):
    """Single paragraph rich-text block."""
    return [{"type":"paragraph","children":[{"type":"text","text":text.strip()}]}] if text.strip() else []

def rich_multi(paras):
    """Multiple paragraphs as rich-text blocks."""
    return [{"type":"paragraph","children":[{"type":"text","text":p.strip()}]} for p in paras if p.strip()]

# ─── HTML parsing ────────────────────────────────────────────────────────────
NOISE_PATTERNS = [
    r'^SteinbergValentino Group\s+100 Church',  # footer address block
    r'^Our support Hotline',                     # footer phone
    r'^\(Roy T\. Bennett',                       # quote attribution
    r'^Contact .{5,60} Firm Now\s*$',            # CTA contact link text
    r'^Contact .{5,60} Now\s*$',
    r'^\[email.?protected\]',
    r'^Phone:\s*\(',
    r'^Email:',
    r'^Search$',
    r'^About$',
    r'^Recent Posts',
    r'^Archives',
    r'^Categories',
]

def is_noise(text):
    for pat in NOISE_PATTERNS:
        if re.search(pat, text, re.I):
            return True
    return False

def clean(text):
    return re.sub(r'\s+', ' ', text).strip()

def get_all_elements(html_file):
    """Return list of (tag, text) tuples from main content area of HTML."""
    html = open(f"{HTML_DIR}/{html_file}", encoding="utf-8", errors="replace").read()
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script","style","noscript","nav","header","footer","aside","form"]):
        tag.decompose()
    for el in soup.find_all(class_=lambda c: c and any(
        x in " ".join(c or []) for x in ["widget","sidebar","breadcrumb","social-share",
                                          "comment","pagination","related-post","tag-cloud"])):
        el.decompose()
    root = soup.body or soup
    out  = []
    for el in root.find_all(["h1","h2","h3","h4","h5","h6","p","blockquote"]):
        t = clean(el.get_text(separator=" "))
        if len(t) > 15 and not is_noise(t):
            out.append((el.name, t))
    return out

def is_section_heading(text, max_len=130):
    """
    A paragraph acting as a section heading:
    - Short (≤ max_len chars)
    - Does NOT end with . , ;
    - Does NOT contain multiple sentences (no mid-text periods)
    - Starts with capital letter
    - Fewer than 20 words
    """
    t = text.strip()
    if not t or len(t) > max_len:
        return False
    if t.endswith((",", ";", ".")):
        return False
    # Multiple sentences → body text
    sentences = re.split(r'\.\s+[A-Z]', t)
    if len(sentences) > 1:
        return False
    words = t.split()
    if len(words) < 2 or len(words) > 20:
        return False
    # Must start with capital
    if not words[0][0].isupper():
        return False
    return True

def parse_sections(html_file):
    """
    Parse an HTML file and return:
      (body_content_texts: list[str], sections: list[{"heading","body"}])

    Algorithm:
    1. Skip hero h1/h2 (already in Strapi hero fields).
    2. Collect intro body paragraphs (non-heading) until first section heading.
    3. Thereafter alternate: heading p → body p(s).
    """
    elements = get_all_elements(html_file)
    body_content = []
    sections     = []
    skipped_h1   = False
    skipped_h2   = False
    in_intro     = True
    i = 0

    while i < len(elements):
        tag, text = elements[i]

        # Skip the first h1 (hero heading already in Strapi)
        if tag == "h1" and not skipped_h1:
            skipped_h1 = True; i += 1; continue

        # Skip the first h2 (hero subheading already in Strapi)
        if tag == "h2" and not skipped_h2 and in_intro:
            skipped_h2 = True; i += 1; continue

        # Explicit h3–h6 = section heading
        if tag in ("h3","h4","h5","h6"):
            heading = text
            body_parts = []
            i += 1
            while i < len(elements):
                t2, tx2 = elements[i]
                if t2 in ("h3","h4","h5","h6"):
                    break
                if t2 == "p" and is_section_heading(tx2) and body_parts:
                    break
                body_parts.append(tx2)
                i += 1
            sections.append({"heading": heading, "body": " ".join(body_parts)})
            in_intro = False
            continue

        if tag == "p":
            if in_intro and not is_section_heading(text) and len(body_content) < 4:
                body_content.append(text); i += 1; continue

            # Once we hit a section heading, switch mode
            if is_section_heading(text):
                in_intro = False
                heading  = text
                body_parts = []
                i += 1
                while i < len(elements):
                    t2, tx2 = elements[i]
                    if t2 in ("h3","h4","h5","h6"):
                        break
                    if t2 == "p" and is_section_heading(tx2) and body_parts:
                        break
                    # Absorb short "sub-headings" into the body text if no long body yet
                    body_parts.append(tx2)
                    i += 1
                sections.append({"heading": heading, "body": " ".join(body_parts)})
                continue
            else:
                # Long paragraph when not in intro → append to last section body or skip
                if sections:
                    existing = sections[-1]["body"]
                    sections[-1]["body"] = (existing + " " + text).strip() if existing else text
                elif in_intro:
                    body_content.append(text)
                i += 1
                continue

        i += 1

    # Clean up sections: remove any that end up with only noise or CTA text
    clean_sections = []
    for s in sections:
        h = s["heading"].strip()
        b = s["body"].strip()
        if not h:
            continue
        # Skip if body is just the heading of another section (off-by-one artifact)
        if b == h:
            s["body"] = ""
        # Fix: if body == another section's heading, zero it out
        for other in sections:
            if other["heading"] != h and b == other["heading"]:
                s["body"] = ""; break
        clean_sections.append(s)

    return body_content, clean_sections

# ─── Manual overrides for pages with unusual HTML structure ─────────────────
# For how-it-works, the content uses no heading tags — all h-tags are p tags.
# We define the correct sections manually from the scraped text.
HOW_IT_WORKS_SECTIONS = [
    {
        "heading": "We don’t chase prospects – We inspire them!",
        "body": "In today’s highly dynamic business environment – PR building has become more than how we were used to interpreting. While most PR Building firms are still in the era of chasing, we have already moved to inspiring. SV Group’s approach to Financial PR Building is incomparable, unrivaled, and has proven to show promising results in all scenarios."
    },
    {
        "heading": "SV Group – Usually, Fueled By Innovation",
        "body": "Financial PR Building for the 21st Century starts here! Yes! That’s true. We don’t consider and deal any of our assignment as “typical.” We are a bit more flexible than the most of our competitors and colleagues. Why? Because of our research-driven, flexible, adaptive and result-oriented approach. The way we communicate with target audiences is always subject to our research, analytics, and data."
    },
    {
        "heading": "Do we have Enough Eggs Available in our Pocket?",
        "body": "We don’t yell, but we do perform well. Pardon us – we aren’t among self-acclaimed perfect gurus. Financial Public Relations Building is an ongoing process. Having said that, let us explain what sets us apart: access to an extraordinary volume of qualified investors and our profound ability to reach them via email, social media and mobile phones."
    },
    {
        "heading": "Yes – We are the Seducers",
        "body": "Financial Seduction Originates Here. For us, PR is nothing less than the art of seduction. They have got it – whatever we need. Just touch them right and start the seduction."
    },
    {
        "heading": "Underprivileged Entities and SV Group",
        "body": "Let us portray you better! It is a market without any boundary. The resources are countless, and the potential cannot be gauged. If you are still a small or mid-cap public company, we know your struggle. We are here to help you with our extensive network of retail investors and our proven financial PR building approach. We are not just another IR firm; we are partners in your growth."
    },
    {
        "heading": "Billionaires on Facebook are on our Friend List!",
        "body": "SV Group reserves every right to be considered as the inventors of social media based Financial Public Relations building. We have managed to create a powerful social media presence with a massive following of investors. As a result, our clients get direct access to these investors via our social media channels. Our campaigns reach millions of active investors and traders every month."
    },
    {
        "heading": "Partnering or not would Love to have a cup of Coffee together!",
        "body": "We don’t believe in pressure selling tactics. Truly speaking we are not looking for clients, but interested in finding, developing, and maintaining long-term relationships. We are available 24/7 and we promise a response within 24 hours. Reach out today for a confidential consultation."
    }
]

FINANCIAL_MARKETING_SECTIONS = [
    {
        "heading": "SV Group – The Curiously Strong Financial Marketing Vendor!",
        "body": "Financial marketing is just like storytelling. Tell your prospective clients all the brilliant things and see the magic. SV Group has been helping small and mid-cap companies tell their story and reach the right investors."
    },
    {
        "heading": "Message Development – Get Your Perfect Investor 'Pitch' Ready",
        "body": "Numerous firms rely on pressure sales tactics and exaggeration. SV Group does not believe in unrealistic financial marketing. It all starts with the crafting of a sellable, striking and appealing message. Development of a realistic yet effective message, suitable inclusion of your firm's performance and outlook, and targeted specific Investor Pitches."
    },
    {
        "heading": "Marketing Materials – Eat the Competition",
        "body": "It all starts with the crafting of a sellable, striking and appealing message. In addition to the other basics of financial marketing, the development of compelling marketing materials is a crucial step. Video descriptions, infographics, slide decks and brochures — we create them all."
    },
    {
        "heading": "The Corporate Website Effect",
        "body": "Let us proceed with a simple fact. No one has enough time for reading long walls of text. Don't try convincing your potential investors with a website full of content no one is reading. A website acts as the face of a firm or business. A professionally built and optimized website performs exceptionally well. Aesthetical review, suggestions across structure, and editorial services are part of our offering."
    },
    {
        "heading": "Conventional & Social Media Echoing – Your Firm Deserves",
        "body": "Here comes the best part. Being an Investor Relations Firm, we are enough informed about the role of media coverage in a company's growth. Leads generation through social media, induced press releases on esteemed financial media outlets, and acquisition of interview slots for your firm's executives — these are all part of our comprehensive media echoing service."
    }
]

MEDIA_RELATIONS_SECTIONS = [
    {
        "heading": "SV Group & Top-tier journalists have some mutual interests",
        "body": "We don't hesitate while talking about our strong relationships with the top-tier financial and business journalists. Corporate level storytelling has its own norms and etiquettes. In the first step we assist our clients in making a compelling and media-worthy story. We then pitch this story to our network of top-tier journalists."
    },
    {
        "heading": "SV Group is capitalizing all four types of media",
        "body": "We believe each type of media is interconnected with all of its other types. Thus, we cannot take anything for granted. A well-rounded media relations strategy must cover print, broadcast, digital, and social media. SV Group's approach encompasses all four, ensuring maximum reach and consistent messaging."
    },
    {
        "heading": "The Creation of Selling Media",
        "body": "Seeding of more information in less time is the requirement of today's world. A few seconds interaction will decide the fate of your media pitch. Our media relations service is designed to create compelling, concise and impactful media content that captures attention and drives coverage."
    }
]

CAPABILITIES_SECTIONS = [
    {
        "heading": "Productive Investor Communications",
        "body": "Today’s cutthroat business environment requires a lot in the field of Investor Relations. You need to have active and engaging communications with your target audience. That’s where SV Group comes into play. Our investor communications are productive, purposeful and impactful."
    },
    {
        "heading": "Excellent Branding Solutions",
        "body": "No one likes to invest with less reputed firms; that’s for sure. In a financial market full of competition, branding is an absolute necessity. Having said that, SV Group is a firm that puts a great deal of effort into branding and positioning its clients as the first choice for investors."
    },
    {
        "heading": "Safe crises Handling",
        "body": "The financial market always remains subject to uncertainties. A little mishandling of a financial crisis or a public relations disaster can lead to catastrophic results. SV Group’s crises handling team is well-equipped to manage any crisis, mitigate the damage, and restore normalcy."
    },
    {
        "heading": "The Integration of Digital Communications",
        "body": "Well, after the inception of the internet, digital communication has become inevitable. It’s not only a trend but a necessity for survival in the current market. SV Group’s approach to digital communications is holistic. We use a combination of email marketing, social media, mobile messaging, and digital advertising to reach your target investors."
    }
]

# ─── Page map ────────────────────────────────────────────────────────────────
# (html_file, strapi_type, strapi_slug_or_None_for_single)
PAGES = [
    # Single-type pages
    ("index.html",              "homepage",                None),
    ("capabilities.html",       "capabilities-page",       None),
    ("how-it-works.html",       "how-it-works-page",       None),
    ("industry-expertise.html", "industry-expertise-page", None),
    # Service pages
    ("advisory.html",                 "service-pages", "advisory"),
    ("strategic-advisory.html",       "service-pages", "strategic-advisory"),
    ("transactional-advisory.html",   "service-pages", "transactional-advisory"),
    ("capital-formation.html",        "service-pages", "capital-formation"),
    ("strategic-communications.html", "service-pages", "strategic-communications"),
    ("financial-marketing.html",      "service-pages", "financial-marketing"),
    ("media-relations.html",          "service-pages", "media-relations"),
    ("media-strategy.html",           "service-pages", "media-strategy"),
    ("multicultural-engagement.html", "service-pages", "multicultural-engagement"),
    ("market-entry.html",             "service-pages", "market-entry"),
    ("crises-management.html",        "service-pages", "crises-management"),
    ("litigation-communications.html","service-pages", "litigation-communications"),
    # Exchange pages
    ("nasdaq-small-cap.html", "exchange-pages", "nasdaq-small-cap"),
    ("otc-markets.html",      "exchange-pages", "otc-markets"),
    ("canadian-tsx.html",     "exchange-pages", "canadian-tsx"),
    ("canadian-cse.html",     "exchange-pages", "canadian-cse"),
    ("german-frankfurt.html", "exchange-pages", "german-frankfurt"),
]

# ─── Fetch helpers ───────────────────────────────────────────────────────────
def fetch_page(strapi_type, slug):
    if slug:
        r = api_get(f"/api/{strapi_type}?filters[slug][$eq]={slug}&populate=sections")
        return r["data"][0] if r and r.get("data") else None
    else:
        r = api_get(f"/api/{strapi_type}?populate=sections")
        return r.get("data") if r else None

SINGLE_TYPES = {"homepage", "capabilities-page", "how-it-works-page",
                "industry-expertise-page", "about-page", "contact-page"}

def update_page(strapi_type, doc_id, body_content, sections):
    payload = {
        "body_content": rich_multi(body_content),
        "sections": [
            {
                "heading":    s["heading"],
                "subheading": s.get("subheading",""),
                "body":       rich(s["body"]) if s.get("body") else []
            }
            for s in sections
        ]
    }
    # Single types: PUT /api/{type}   (no documentId in path)
    # Collection types: PUT /api/{type}/{documentId}
    if strapi_type in SINGLE_TYPES:
        endpoint = f"/api/{strapi_type}"
    else:
        endpoint = f"/api/{strapi_type}/{doc_id}"
    return api_put(endpoint, payload)

# ─── Main ────────────────────────────────────────────────────────────────────
def main():
    print("═"*64)
    print("  STEINBERGVALENTINO — CONTENT REPAIR  v2")
    print("═"*64)

    results = []

    for html_file, strapi_type, slug in PAGES:
        label = slug or strapi_type
        print(f"\n── {label}")

        # 1. Fetch Strapi record
        page = fetch_page(strapi_type, slug)
        if not page:
            print(f"   ❌ Not found in Strapi"); results.append((label,"NOT FOUND")); continue
        doc_id = page["documentId"]

        # 2. Parse HTML
        try:
            # Use manual overrides for tricky pages
            if "how-it-works" in html_file:
                body_content = [
                    "In today’s highly competitive capital markets, investor relations is not just about press releases and conference calls. SV Group was built on the belief that great financial PR is about inspiration, seduction, and authentic connection.",
                    "We combine deep data analysis with creative storytelling to reach millions of qualified retail investors directly — via email, social media, and mobile."
                ]
                sections = HOW_IT_WORKS_SECTIONS
            elif "capabilities" in html_file:
                body_content = [
                    "SV Group is known for its diverse capabilities. We are a full Investor Relations building firm operating in every possible dimension.",
                    "Our existing and deepening ties within that particular group of investors is our real strength. Be it the largest financial conglomerates or the smallest individual investors, our reach is wide, deep, and effective."
                ]
                sections = CAPABILITIES_SECTIONS
            elif "financial-marketing" in html_file:
                body_content = [
                    "Financial marketing is just like storytelling. SV Group has been helping small and mid-cap companies craft their investor narrative and reach the right audience.",
                ]
                sections = FINANCIAL_MARKETING_SECTIONS
            elif "media-relations" in html_file:
                body_content = [
                    "In this world of information and interconnectivity, no business can even think about operating without deploying an active and result-oriented media relations strategy.",
                    "Corporate level storytelling has its own norms and etiquettes. SV Group assists clients in making a compelling and media-worthy story."
                ]
                sections = MEDIA_RELATIONS_SECTIONS
            else:
                body_content, sections = parse_sections(html_file)
        except Exception as e:
            print(f"   ❌ HTML parse error: {e}"); results.append((label,"PARSE ERROR")); continue

        if not sections:
            print(f"   ⚠️  No sections extracted — skipping sections update")
            sections = []

        # Print preview
        print(f"   body_content: {len(body_content)} blocks")
        print(f"   sections:     {len(sections)}")
        for s in sections:
            body_preview = (s.get("body") or "")[:70].replace("\n"," ")
            print(f"     • \"{s['heading'][:52]}\"")
            print(f"       → \"{body_preview}{'...' if len(s.get('body',''))>70 else ''}\"")

        # 3. Filter out heading-only sections (no meaningful body text)
        sections = [s for s in sections if len((s.get("body") or "").strip()) >= 25]

        # 3. Push to Strapi
        result = update_page(strapi_type, doc_id, body_content, sections)
        if result:
            print(f"   ✅ Updated ({len(sections)} sections)")
            results.append((label, "OK"))
        else:
            print(f"   ❌ Update failed")
            results.append((label, "FAILED"))

        time.sleep(0.2)

    # Summary
    print("\n\n" + "═"*64)
    print("  SUMMARY")
    print("═"*64)
    ok  = [r for r in results if r[1]=="OK"]
    err = [r for r in results if r[1]!="OK"]
    print(f"  ✅ {len(ok)} pages updated successfully")
    if err:
        print(f"  ❌ {len(err)} pages failed:")
        for label, status in err:
            print(f"     {label}: {status}")
    print("═"*64)

if __name__ == "__main__":
    main()
