import React from 'react';
import Link from 'next/link';
import { Sparkles, Phone, Mail, MapPin, Instagram, Facebook, Twitter, Youtube, Heart } from 'lucide-react';

const services = [
  { label: 'Hair Care', href: '/services?category=hair-care' },
  { label: 'Skin Care', href: '/services?category=skin-care' },
  { label: 'Nail Care', href: '/services?category=nail-care' },
  { label: 'Makeup', href: '/services?category=makeup' },
  { label: 'Body Spa', href: '/services?category=body-spa' },
  { label: 'Bridal', href: '/services?category=bridal' },
];

const quickLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Our Packages', href: '/packages' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'Book Appointment', href: '/booking' },
];

const legal = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Refund Policy', href: '/refunds' },
];

const socials = [
  { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-500' },
  { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-500' },
  { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-sky-400' },
  { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:text-red-500' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0010 0%, #2D0018 50%, #1a0010 100%)' }}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-luxury py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-heading font-bold text-xl text-white">SS Beauty</div>
                <div className="text-[10px] text-primary/70 tracking-widest uppercase">Parlour</div>
              </div>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              Where beauty meets perfection. We offer premium beauty services in a luxurious, welcoming environment that makes every visit a special experience.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 transition-all duration-300 hover:bg-white/20 hover:scale-110 ${color}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading font-semibold text-white text-lg mb-5">Our Services</h3>
            <ul className="space-y-2.5">
              {services.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-white text-lg mb-5">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-5">
            <div>
              <h3 className="font-heading font-semibold text-white text-lg mb-5">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-white/80">9751972900</p>
                    <p className="text-xs text-white/40">Mon–Sat, 9AM–8PM</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-white/80">ssbeautyparlour2528@gmail.com</p>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-white/80 leading-relaxed">Old Bus Stand Opposite, Chengam,<br />Thiruvannamalai District, Tamilnadu</p>
                </li>
              </ul>
            </div>
            {/* Hours */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Opening Hours</p>
              <div className="space-y-1">
                {[
                  ['Mon – Fri', '9:00 AM – 8:00 PM'],
                  ['Saturday', '9:00 AM – 9:00 PM'],
                  ['Sunday', '10:00 AM – 6:00 PM'],
                ].map(([day, time]) => (
                  <div key={day} className="flex justify-between text-xs">
                    <span className="text-white/50">{day}</span>
                    <span className="text-white/80">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 flex items-center gap-1">
            © {new Date().getFullYear()} SS Beauty Parlour. Made with <Heart className="w-3 h-3 text-primary fill-primary" /> All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {legal.map(({ label, href }) => (
              <Link key={label} href={href} className="text-xs text-white/40 hover:text-primary transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
