/**
 * Footer Component - World-Class Footer
 */

'use client'

import Link from 'next/link'

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Vision Tests', href: '/tests' },
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Find Specialists', href: '/specialists' },
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api' },
      { label: 'Clinical Studies', href: '/studies' },
      { label: 'Blog', href: '/blog' },
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Medical Disclaimer', href: '/medical-disclaimer' },
      { label: 'Cookie Policy', href: '/cookies' },
    ]
  },
  {
    title: 'About',
    links: [
      { label: 'Our Mission', href: '/about' },
      { label: 'Advisory Board', href: '/advisory' },
      { label: 'Partners', href: '/partners' },
      { label: 'Contact', href: '/contact' },
    ]
  }
]

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">👁️</span>
              <div>
                <div className="text-xl font-bold text-white">Spect-IT</div>
                <div className="text-xs">Vision Screening</div>
              </div>
            </div>
            <p className="text-sm mb-4">
              LiDAR-enhanced digital vision screening for emerging markets.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>

          {/* Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            © 2025 Spect-IT. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/medical-disclaimer" className="hover:text-white">
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

