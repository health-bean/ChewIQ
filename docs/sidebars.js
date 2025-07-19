/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    'quick-start',
    {
      type: 'category',
      label: 'Getting Started',
      items: ['development/setup'],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: ['architecture/overview'],
    },
    {
      type: 'category',
      label: 'Database',
      items: ['database/overview'],
    },
    {
      type: 'category', 
      label: 'Components',
      items: ['components/overview'],
    },
    {
      type: 'category',
      label: 'API Reference', 
      items: ['api/overview'],
    },
    {
      type: 'category',
      label: 'Security',
      items: ['security/overview'],
    },
    {
      type: 'category',
      label: 'Configuration',
      items: ['configuration/deployment', 'configuration/environment'],
    },
    {
      type: 'category',
      label: 'Deployment',
      items: ['deployment/overview'],
    },
  ],
};

export default sidebars;
