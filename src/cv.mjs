import { cvContent } from './cv-content.mjs';

export function initCV(profile, root = document) {
  const page = root.querySelector('#cv');
  const content = root.querySelector('#cv-content');
  const toggle = root.querySelector('#cv-language-toggle');
  let language = 'en';

  function element(tag, className, text) {
    const node = root.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function link(label, href, external = false) {
    const node = element('a', '', label);
    node.href = href;
    if (external) {
      node.target = '_blank';
      node.rel = 'noopener noreferrer';
    }
    return node;
  }

  function section(name, label) {
    const node = element('section', 'cv-section');
    const heading = element('h3', '', label);
    heading.id = `cv-${name}-heading`;
    node.setAttribute('aria-labelledby', heading.id);
    node.append(heading);
    return node;
  }

  function render(announce = false) {
    const copy = cvContent[language];
    page.lang = language;
    root.querySelector('#cv-eyebrow').textContent = copy.eyebrow;
    root.querySelector('#cv-title-prefix').textContent = copy.title;
    root.querySelector('#cv-introduction').textContent = copy.introduction;
    root.querySelector('#cv-language-label').textContent = copy.switchLabel;
    toggle.lang = copy.nextLanguage;
    toggle.setAttribute('aria-label', copy.switchDescription);

    const header = element('header', 'cv-header');
    const name = element('h2', '', 'Yassine Ben Azizi');
    name.id = 'cv-name';
    const contacts = element('div', 'cv-contacts');
    contacts.append(
      element('span', 'cv-location', copy.location),
      link(profile.email, `mailto:${profile.email}`),
      link('GitHub ↗', profile.github, true),
      link('LinkedIn ↗', profile.linkedin, true),
      link('Hack The Box ↗', 'https://profile.hackthebox.com/profile/019db950-fbc3-702c-8b11-3ec8312c9141', true),
    );
    header.append(element('p', 'eyebrow', 'Curriculum vitae'), name, element('p', 'cv-role', copy.role), contacts);

    const layout = element('div', 'cv-layout');
    const main = element('div', 'cv-main');
    const sidebar = element('div', 'cv-sidebar');
    const experience = section('experience', copy.sections.experience);
    const job = element('div', 'cv-entry');
    const jobHeading = element('div', 'cv-entry-heading');
    jobHeading.append(element('h4', '', copy.job.role), element('p', 'cv-date', copy.job.dates));
    const highlights = element('ul', 'cv-highlights');
    copy.job.highlights.forEach(text => highlights.append(element('li', '', text)));
    job.append(jobHeading, element('p', 'cv-employer', `${copy.job.company} · ${copy.job.location}`), highlights);
    experience.append(job);

    const education = section('education', copy.sections.education);
    copy.education.forEach(item => {
      const entry = element('div', 'cv-entry cv-education-entry');
      entry.append(element('p', 'cv-date', item.dates), element('h4', '', item.title));
      if (item.detail) entry.append(element('p', 'cv-degree-detail', item.detail));
      entry.append(element('p', 'cv-school', `${item.school} · ${item.location}`));
      education.append(entry);
    });
    main.append(experience, education);

    const certifications = section('certifications', copy.sections.certifications);
    const credentials = element('ul', 'cv-credentials');
    copy.credentials.forEach(item => {
      const entry = element('li');
      entry.append(element('span', '', item.name), element('time', 'cv-date', item.year));
      entry.lastElementChild.dateTime = item.year;
      credentials.append(entry);
    });
    const credentialLink = link(`${copy.credentialLink} ↗`, '#certifications');
    credentialLink.className = 'text-link cv-certifications-link';
    certifications.append(credentials, credentialLink);

    const skills = section('technologies', copy.sections.technologies);
    const groups = element('dl', 'cv-skills');
    copy.technologies.forEach((items, index) => {
      const group = element('div');
      group.append(element('dt', '', copy.technologyLabels[index]), element('dd', '', items.join(' · ')));
      groups.append(group);
    });
    skills.append(groups);

    const languages = section('languages', copy.sections.languages);
    const languageList = element('ul', 'cv-languages');
    copy.languages.forEach(text => languageList.append(element('li', '', text)));
    languages.append(languageList);
    sidebar.append(certifications, skills, languages);
    layout.append(main, sidebar);
    content.replaceChildren(header, layout);
    if (announce) root.querySelector('#cv-language-status').textContent = copy.announcement;
  }

  toggle.addEventListener('click', () => {
    language = cvContent[language].nextLanguage;
    render(true);
  });
  render();
}
