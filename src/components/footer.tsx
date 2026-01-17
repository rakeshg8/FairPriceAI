'use client';

import { Instagram, Mail } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-6 px-4 sm:px-6 text-center text-muted-foreground">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-4">
            <Link href="/about" className="text-sm hover:text-primary transition-colors">
                About Us
            </Link>
            <div className="flex items-center gap-4">
                <a href="mailto:yramulu613@gmail.com" className="text-sm hover:text-primary transition-colors flex items-center gap-2">
                    <Mail size={16} />
                    Contact
                </a>
                <a href="https://www.instagram.com/sweety______swetha19/" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors flex items-center gap-2">
                    <Instagram size={16} />
                    Instagram
                </a>
            </div>
        </div>
        <p className="text-sm">Powered by Firebase and Genkit.</p>
        <p className="mt-2 text-xs">
          Disclaimer: The price analysis is AI-generated and may not always reflect true market values.
        </p>
      </div>
    </footer>
  );
}
