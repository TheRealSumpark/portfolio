import { safeUrl, formatDate } from './credential-utils.mjs';

// Keep certificate art visible while sending credential checks to HTB.
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function renderCertifications(certifications) {
  const grid = document.querySelector('#certifications-grid');
  grid.replaceChildren();
  document.querySelector('#certifications-empty').hidden = certifications.length > 0;

  certifications.forEach(credential => {
    const card = element('article', 'certification-card');
    const thumbnailUrl = safeUrl(credential.thumbnail, document.baseURI, true);
    if (thumbnailUrl) {
      const image = element('img', 'certificate-preview');
      image.src = thumbnailUrl;
      image.alt = `${credential.name} certificate preview`;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.addEventListener('error', () => { image.hidden = true; }, { once: true });
      card.append(image);
    }

    card.append(element('h2', 'credential-title', credential.name));

    const issued = formatDate(credential.issued);
    if (issued) card.append(element('p', 'credential-meta', `Issued ${issued}`));
    if (credential.credentialId) {
      card.append(element('p', 'credential-id', `Credential ID: ${credential.credentialId}`));
    }

    const verificationUrl = safeUrl(credential.verificationUrl, document.baseURI);
    if (verificationUrl) {
      const verify = element('a', 'button button-secondary credential-verify', 'Verify credential ↗');
      verify.setAttribute('aria-label', `Verify ${credential.name} on Hack The Box`);
      verify.href = verificationUrl;
      verify.target = '_blank';
      verify.rel = 'noopener noreferrer';
      card.append(verify);
    }
    grid.append(card);
  });
}
