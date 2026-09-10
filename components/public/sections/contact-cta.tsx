'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';

export function ContactCtaSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section-py bg-background border-t border-border">
      <div className="container-px mx-auto max-w-4xl text-center">
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-primary/25 bg-primary/8 mb-6">
            <Mail className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Booking & Inquiries</h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto leading-relaxed">
            For event bookings, collaborations, media inquiries, or general messages, we would love to hear from you.
          </p>
          <Link
            href="/contact"
            className="btn-primary mt-8 hover:gap-3 group"
          >
            Get in Touch <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
