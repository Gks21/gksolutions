#!/usr/bin/env python3
"""Generate individual service pages from shared template."""

import os

SERVICES = [
    {
        "slug": "consulting",
        "title": "IT Consulting & Advising",
        "meta": "GK Solutions IT consulting — technology recommendations, project planning, security, and upgrade guidance.",
        "summary": "Help evaluating technology needs, purchases, systems, workflows, security, and future plans.",
        "includes": [
            "Technology recommendations",
            "Project planning",
            "Software selection",
            "Process improvement",
            "Upgrade planning",
            "Vendor guidance",
            "Basic security and backup planning",
        ],
        "note": "Consultations include discussion, intake, and recommendations. They do not include hands-on labor.",
        "cta_primary": ("Book a Consultation", "../book.html"),
        "cta_secondary": ("View Pricing", "../pricing.html"),
    },
    {
        "slug": "it-support",
        "title": "Technical Support",
        "meta": "GK Solutions technical support — computer troubleshooting, software issues, printers, email, and more.",
        "summary": "Help diagnosing and resolving everyday technology problems.",
        "includes": [
            "Computer troubleshooting",
            "Software issues",
            "Account and login problems",
            "Printer troubleshooting",
            "Device connectivity",
            "Email configuration",
            "Basic malware concerns",
            "General technical assistance",
        ],
        "note": "Available remotely or on-site where appropriate.",
        "cta_primary": ("Book Support", "../book.html"),
        "cta_secondary": ("View Pricing", "../pricing.html"),
    },
    {
        "slug": "setup",
        "title": "Setup Services",
        "meta": "GK Solutions setup services — computer, device, printer, and software installation and configuration.",
        "summary": "Installation and configuration of new or existing technology.",
        "includes": [
            "Computer setup",
            "Device setup",
            "Printer setup",
            "Software installation",
            "Account configuration",
            "Data transfers",
            "Home-office setup",
            "Basic workstation setup",
        ],
        "note": "Common setup services use flat rates whenever possible. Larger jobs receive an estimate first.",
        "cta_primary": ("Book Setup", "../book.html"),
        "cta_secondary": ("View Pricing", "../pricing.html"),
    },
    {
        "slug": "network",
        "title": "Network & Wi-Fi",
        "meta": "GK Solutions network services — router setup, Wi-Fi troubleshooting, coverage, and small-office planning.",
        "summary": "Help with connectivity, coverage, and network equipment.",
        "includes": [
            "Router setup",
            "Wi-Fi troubleshooting",
            "Device connections",
            "Coverage evaluation",
            "Network equipment installation",
            "Small-office network planning",
            "Guest network setup",
        ],
        "note": "Hardware and equipment costs are separate.",
        "cta_primary": ("Book a Service", "../book.html"),
        "cta_secondary": ("Request a Quote", "../quote.html"),
    },
    {
        "slug": "websites",
        "title": "Website Services",
        "meta": "GK Solutions website services — development, redesigns, maintenance, accessibility, and hosting guidance.",
        "summary": "Planning, building, improving, or maintaining websites.",
        "includes": [
            "New website development",
            "Website redesigns",
            "Content updates",
            "Forms and integrations",
            "Maintenance",
            "Troubleshooting",
            "Accessibility improvements",
            "Hosting guidance",
        ],
        "note": "Website work should normally require a consultation and quote.",
        "cta_primary": ("Request a Quote", "../quote.html"),
        "cta_secondary": ("Book a Consultation", "../book.html"),
    },
    {
        "slug": "custom-software",
        "title": "Custom Software",
        "meta": "GK Solutions custom software — internal apps, portals, workflow automation, dashboards, and integrations.",
        "summary": "Custom tools built around an organization's actual workflow.",
        "includes": [
            "Internal applications",
            "Employee portals",
            "Request and approval systems",
            "Workflow automation",
            "Reporting tools",
            "Dashboards",
            "Integrations",
            "Legacy system replacement",
        ],
        "note": "These services require evaluation, planning, and a custom quote.",
        "cta_primary": ("Request a Quote", "../quote.html"),
        "cta_secondary": ("Book a Consultation", "../book.html"),
    },
    {
        "slug": "contract-support",
        "title": "Contract IT Support",
        "meta": "GK Solutions contract IT support — project assistance, deployments, migrations, training, and ongoing coverage.",
        "summary": "Project-based or ongoing support for businesses and organizations.",
        "includes": [
            "Temporary technical coverage",
            "Project assistance",
            "Deployments",
            "Migrations",
            "Documentation",
            "Staff training",
            "System support",
            "Development support",
        ],
        "note": "Small-business options may use fixed pricing or support plans. Enterprise work is quote-only.",
        "cta_primary": ("Request a Quote", "../quote.html"),
        "cta_secondary": ("View Support Plans", "../support-plans.html"),
    },
]

TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="{meta}" />
  <meta name="theme-color" content="#232323" />
  <title>{title} — GK Solutions</title>
  <link rel="icon" href="../img/gks_favicon.png" type="image/png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../css/styles.css" />
</head>
<body data-page="services" data-base="..">
  <div id="site-header"></div>

  <main>
    <section class="page-hero">
      <div class="page-hero-bg" aria-hidden="true"></div>
      <div class="container">
        <p class="section-eyebrow"><a href="../services.html" style="color:var(--accent)">Services</a></p>
        <h1 class="page-title">{title}</h1>
        <p class="page-lead">{summary}</p>
      </div>
    </section>

    <section class="page-content">
      <div class="container" style="max-width:720px">
        <h2 class="section-title" style="font-size:1.1rem;margin-bottom:16px">What's included</h2>
        <ul class="service-includes" style="margin-bottom:28px">
{includes_html}
        </ul>
        <p class="pricing-note">{note}</p>
      </div>
    </section>

    <section class="cta-band">
      <div class="container">
        <h2>Ready to get started?</h2>
        <div class="hero-actions">
          <a href="{cta_primary_href}" class="btn btn-primary">{cta_primary_label}</a>
          <a href="{cta_secondary_href}" class="btn btn-secondary">{cta_secondary_label}</a>
        </div>
      </div>
    </section>
  </main>

  <div id="site-footer"></div>
  <div id="site-mobile-actions"></div>

  <script src="../js/site-shell.js"></script>
  <script src="../js/main.js"></script>
</body>
</html>
"""

os.makedirs("services", exist_ok=True)

for svc in SERVICES:
    includes_html = "\n".join(f"          <li>{item}</li>" for item in svc["includes"])
    html = TEMPLATE.format(
        meta=svc["meta"],
        title=svc["title"],
        summary=svc["summary"],
        includes_html=includes_html,
        note=svc["note"],
        cta_primary_href=svc["cta_primary"][1],
        cta_primary_label=svc["cta_primary"][0],
        cta_secondary_href=svc["cta_secondary"][1],
        cta_secondary_label=svc["cta_secondary"][0],
    )
    path = os.path.join("services", f"{svc['slug']}.html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Wrote {path}")

print("Done.")
