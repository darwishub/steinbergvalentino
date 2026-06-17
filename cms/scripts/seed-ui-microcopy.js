/**
 * Seeds all UI microcopy fields (eyebrows, CTAs, labels, form/search text,
 * service & exchange templates) so 100% of rendered text is CMS-driven.
 * Run with Node 18 from cms/ while Strapi is stopped.
 */
const Database = require('better-sqlite3')
const db = new Database('./database/.tmp/data.db')
db.pragma('foreign_keys = ON')

function setAll(table, values) {
  const cols = Object.keys(values)
  const sql = `UPDATE ${table} SET ${cols.map((c) => `"${c}" = ?`).join(', ')}`
  const res = db.prepare(sql).run(...cols.map((c) => values[c]))
  console.log(`${table}: set ${cols.length} fields on ${res.changes} row(s)`)
}

setAll('global_settings', {
  nav_cta_label: 'Contact Us',
  footer_contact_heading: 'Contact',
  footer_email_label: 'Email',
  footer_phone_label: 'Phone',
  footer_office_label: 'Office',
  footer_firm_heading: 'The Firm',
  footer_services_heading: 'Services',
  footer_exchanges_heading: 'Exchanges',
  faq_eyebrow: 'FAQ',
  faq_title: 'Frequently Asked Questions',
  search_eyebrow: 'Site Search',
  search_button_label: 'Search',
  search_empty_text: 'Enter a term above to search across our services, exchanges, and firm pages.',
  search_type_page: 'Page',
  search_type_service: 'Service',
  search_type_exchange: 'Exchange',
  search_results_singular: 'result',
  search_results_plural: 'results',
  form_first_name_label: 'First Name',
  form_last_name_label: 'Last Name',
  form_email_label: 'Email',
  form_message_label: 'Message',
  form_submit_label: 'Submit',
  form_submitting_label: 'Sending...',
  form_success_heading: 'Thank you',
  form_success_body: 'Your message has been received.',
  label_read_more: 'Read More',
  label_all_services: 'All Services',
  label_view_details: 'View details →',
  service_overview_eyebrow: 'What We Do',
  service_overview_band_eyebrow: 'Overview',
  service_engage_heading: 'Interested in {service}?',
  service_engage_body:
    "Speak with our team to learn how this service can be tailored to your company's needs and objectives.",
  service_engage_cta_label: 'Contact Us',
  service_back_label: '← All Services',
  service_approach_title: 'Our Approach',
  service_cta_eyebrow: 'Next Step',
  service_cta_heading: 'Ready to put {service} to work for your company?',
  service_cta_label: 'Contact Our Team',
  service_news_eyebrow: 'News & Insights',
  service_news_heading: 'Updates from {service}',
  service_news_cta_label: 'Read More',
  exchange_hero_eyebrow: 'Exchange Support',
  exchange_breadcrumb_label: 'Market Entry',
  exchange_approach_title: 'Our Approach',
  exchange_keyfacts_eyebrow: 'Key Facts',
  exchange_cta_eyebrow: 'Ready to List?',
  exchange_cta_heading: 'Let us guide your {exchange} listing journey.',
  exchange_cta_label: 'Contact the Firm',
})

setAll('how_it_works_pages', {
  hero_eyebrow: 'Our Process',
  approach_title: 'Our Approach',
  cta_eyebrow: 'Start the Conversation',
  cta_heading: 'Ready to see the process in action?',
  cta_label: 'Schedule a Consultation',
})

setAll('capabilities_pages', {
  hero_eyebrow: 'What We Do',
  approach_title: 'Our Approach',
  cta_eyebrow: 'Work With Us',
  cta_heading: 'Ready to build your investor relations program?',
  cta_label: 'Contact the Firm',
})

setAll('industry_expertise_pages', {
  hero_eyebrow: 'Sector Knowledge',
  approach_title: 'Our Approach',
  sectors_eyebrow: 'Sectors We Cover',
  cta_eyebrow: 'Work With Us',
  cta_heading: 'Ready to build your investor relations program?',
  cta_label: 'Contact the Firm',
})

setAll('about_pages', { hero_eyebrow: 'About the Firm' })
setAll('contact_pages', { hero_eyebrow: 'Get in Touch', form_eyebrow: 'Get in Touch' })

console.log('done')
