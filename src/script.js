import './style.css';
import { profile, projects, certifications } from './content.js';
import { initScene } from './scene.js';
import { initSound } from './sound.js';
import { renderCertifications } from './certifications.js';
import { createPageNavigation } from './navigation.mjs';
import { initCV } from './cv.mjs';

const routeLabels = { home: 'Home', projects: 'Projects', certifications: 'Certifications', about: 'About', cv: 'CV', contact: 'Contact' };

function renderProjects() {
  const grid = document.querySelector('#projects-grid');
  projects.forEach((project, index) => {
    const card = document.createElement('a');
    card.className = `project-card${project.featured ? ' featured' : ''}`;
    card.href = project.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    const top = document.createElement('div');
    top.className = 'card-top';
    const category = document.createElement('span');
    category.className = 'card-index';
    category.textContent = `${String(index + 1).padStart(2, '0')} / ${project.category}`;
    const arrow = document.createElement('span');
    arrow.className = 'project-arrow';
    arrow.textContent = '↗';
    arrow.setAttribute('aria-hidden', 'true');
    top.append(category, arrow);
    const title = document.createElement('h2');
    title.textContent = project.name;
    const description = document.createElement('p');
    description.textContent = project.description;
    const bottom = document.createElement('div');
    bottom.className = 'card-bottom';
    const tags = document.createElement('div');
    tags.className = 'tags';
    const tag = document.createElement('span');
    tag.textContent = project.tag;
    tags.append(tag);
    const action = document.createElement('span');
    action.className = 'text-link';
    action.textContent = 'View repository ↗';
    bottom.append(tags, action);
    card.append(top, title, description, bottom);
    grid.append(card);
  });
}

// Profile links live in one place so email and social links stay consistent.
document.querySelectorAll('[data-profile-link]').forEach(link => {
  const field = link.dataset.profileLink;
  link.href = field === 'email' ? `mailto:${profile.email}` : profile[field];
});
document.querySelectorAll('[data-profile]').forEach(element => {
  element.textContent = profile[element.dataset.profile];
});
document.querySelector('#year').textContent = new Date().getFullYear();
renderProjects();
renderCertifications(certifications);
initCV(profile);
initSound();
const scene = initScene(document.querySelector('#canvasContainer'));
let currentRoute;
const main = document.querySelector('#main');
const pages = [...document.querySelectorAll('.page')];
const travel = createPageNavigation({
  scene,
  onStart(route) {
    // visibility hides descendants from keyboard navigation as well as sight.
    // Keep the incoming layout in place so the footer does not jump mid-flight.
    main.setAttribute('aria-busy', 'true');
    main.classList.add('is-travelling');
    pages.forEach(page => {
      page.classList.remove('is-arriving');
      page.hidden = page.id !== route;
    });
    document.querySelectorAll('[data-route]').forEach(link => {
      if (link.dataset.route === route) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.body.dataset.route = route;
    document.title = `${routeLabels[route]} — Yassine B.A | Cybersecurity Engineer`;
    window.scrollTo(0, 0);
  },
  onComplete(route, initial) {
    main.classList.remove('is-travelling');
    main.removeAttribute('aria-busy');
    document.getElementById(route).classList.add('is-arriving');
    if (!initial) {
      document.querySelector(`#${route}-title`).focus({ preventScroll: true });
      document.querySelector('#route-announcement').textContent = `${routeLabels[route]} section`;
    }
  },
});

function navigate(initial = false) {
  const requested = window.location.hash.slice(1);
  const route = Object.prototype.hasOwnProperty.call(routeLabels, requested) ? requested : 'home';
  if (requested && requested !== route) history.replaceState(null, '', '#home');
  if (route === currentRoute) return;
  currentRoute = route;
  travel(route, initial);
}
window.addEventListener('hashchange', () => navigate());
navigate(true);
