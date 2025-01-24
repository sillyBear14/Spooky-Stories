'use client'

import { motion } from 'framer-motion'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="container py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-creepy spooky-text"
            >
              🏰 Spooky Stories
            </motion.h3>
            <p className="text-sm text-muted-foreground">
              Where nightmares come alive through words...
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">Ghost Stories</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">Urban Legends</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">Paranormal</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">Psychological Horror</a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Join Us</h4>
            <p className="text-sm text-muted-foreground">
              Share your darkest tales with our growing community of horror enthusiasts.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Twitter"
              >
                𝕏
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Discord"
              >
                Discord
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="GitHub"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Spooky Stories. All rights reserved. Enter at your own risk...
          </p>
        </div>
      </div>
    </footer>
  )
} 