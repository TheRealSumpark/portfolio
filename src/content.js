// Public portfolio content. Keep private information out of this file.
export const profile = {
  name: 'Ben Azizi Yassine',
  role: 'Cybersecurity engineer',
  email: 'b.a.yassine.perso@gmail.com',
  github: 'https://github.com/TheRealSumpark',
  linkedin: 'https://www.linkedin.com/in/yassine-ben-azizi/',
};

export const projects = [
  {
    name: 'E-Portfolio', category: 'Creative development', tag: 'Three.js',
    description: 'A small universe on the web. An interactive portfolio built with Three.js, particles, and a little curiosity.',
    url: 'https://github.com/TheRealSumpark/portfolio', featured: true,
  },
  {
    name: 'BestHost', category: 'Web application', tag: 'Symfony',
    description: 'A web application for discovering and booking guest houses.',
    url: 'https://github.com/PIDEVSportify/BestHost',
  },
  {
    name: 'Sportify', category: 'Desktop application', tag: 'Qt',
    description: 'A sports club management application for inventory, scheduling, and streaming matches.',
    url: 'https://github.com/TheRealSumpark/QT_Project',
  },
  {
    name: 'Kingdom Redemption', category: 'Game development', tag: 'SDL',
    description: 'A platform game built with SDL. Exploring interaction, storytelling, and the mechanics behind play.',
    url: 'https://github.com/TheRealSumpark/SDL_Project',
  },
  {
    name: 'Simple Arduino Integrator', category: 'Developer tooling', tag: 'C',
    description: 'A parser written in C for integrating Arduino project files.',
    url: 'https://github.com/TheRealSumpark/SimpleArduinoIntegrator',
  },
];

// Display order: CPTS, CWES, CJCA. Details transcribed from the supplied PDFs.
// Keep asset paths relative for GitHub Pages subdirectory hosting.
const htbProfile = 'https://profile.hackthebox.com/profile/019db950-fbc3-702c-8b11-3ec8312c9141/certificate';
export const certifications = [
  {
    id: 'htb-cpts',
    name: 'Certified Penetration Testing Specialist (CPTS)',
    issuer: 'Hack The Box',
    issued: '2026-04-20',
    credentialId: 'HTBCERT-73823E6BB6',
    verificationUrl: `${htbProfile}/HTBCERT-73823E6BB6`,
    thumbnail: 'certifications/htb-cpts-preview.png',
  },
  {
    id: 'htb-cwes',
    name: 'Certified Web Exploitation Specialist (CWES)',
    issuer: 'Hack The Box',
    issued: '2026-02-02',
    credentialId: 'HTBCERT-878C810ABC',
    verificationUrl: `${htbProfile}/HTBCERT-878C810ABC`,
    thumbnail: 'certifications/htb-cwes-preview.png',
  },
  {
    id: 'htb-cjca',
    name: 'Certified Junior Cybersecurity Associate (CJCA)',
    issuer: 'Hack The Box',
    issued: '2026-10-29',
    credentialId: 'HTBCERT-381B7FD7E7',
    verificationUrl: `${htbProfile}/HTBCERT-381B7FD7E7`,
    thumbnail: 'certifications/htb-cjca-preview.png',
  },
];
