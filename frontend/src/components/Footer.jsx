import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  const footerLinks = [
    {
      title: 'Company',
      links: [
        'FAQ',
        'Help Center',
        'Account',
        'Media Center',
        'Investor Relations',
        'Jobs',
        'Redeem Gift Cards',
        'Buy Gift Cards',
        'Ways to Watch',
        'Terms of Use',
        'Privacy',
        'Cookie Preferences',
        'Corporate Information',
        'Contact Us',
        'Speed Test',
        'Legal Notices',
        'Only on Netflix'
      ]
    }
  ];

  return (
    <footer className="bg-black text-gray-400 py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Social Links */}
        <div className="flex space-x-4 mb-8">
          <a
            href="#"
            className="text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Facebook"
          >
            <Facebook className="h-6 w-6" />
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Instagram"
          >
            <Instagram className="h-6 w-6" />
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Twitter"
          >
            <Twitter className="h-6 w-6" />
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="YouTube"
          >
            <Youtube className="h-6 w-6" />
          </a>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {footerLinks[0].links.map((link, index) => (
            <a
              key={index}
              href="#"
              className="text-sm hover:text-white transition-colors duration-200 underline"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Service Code */}
        <div className="mb-6">
          <button className="text-sm text-gray-400 hover:text-white border border-gray-400 hover:border-white px-4 py-2 transition-colors duration-200">
            Service Code
          </button>
        </div>

        {/* Copyright */}
        <div className="text-sm text-gray-500">
          © 1997-2025 Netflix, Inc.
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-xs text-gray-500 space-y-2">
          <p>
            Netflix Clone - Built for educational purposes only. This is not affiliated with Netflix, Inc.
          </p>
          <p>
            This application uses The Movie Database (TMDB) API for movie and TV show information.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;