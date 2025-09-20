'use client'

import { useId } from 'react'
import Image from 'next/image'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'

import { Container } from '@/components/Container'
import { Users, History, Origami } from "lucide-react"
import screenshotContacts from '@/images/screenshots/contacts.png'
import screenshotInventory from '@/images/screenshots/inventory.png'
import screenshotProfitLoss from '@/images/screenshots/profit-loss.png'

const features = [
  {
    name: 'Collaboration',
    summary: 'Work together on documents in real time.',
    description:
      'Even if you’re miles apart, share drafts and let teammates edit, comment, and refine with you.',
    icon: Users, 
  },
  {
    name: 'Version History',
    summary: 'Never lose your best draft.',
    description:
      'Roll back to earlier versions and compare changes so every word is under your control.',
    icon: History,
  },
  {
    name: 'Custom Styles',
    summary: 'Make your writing truly yours.',
    description:
      'Save personalized tone and formatting presets for consistent, brand-ready outputs.',
    icon: Origami,
  },
]

function Feature({ feature, isActive, className, ...props }) {
  return (
    <div
      className={clsx(className, !isActive && 'opacity-75 hover:opacity-100')}
      {...props}
    >
      <div
        className={clsx(
          'w-9 rounded-lg flex items-center justify-center p-2',
          isActive ? 'bg-rose-600' : 'bg-zinc-500',
        )}
      >
        
        <feature.icon size={28} strokeWidth={1.5} className="text-white" />
      </div>
      <h3
        className={clsx(
          'mt-6 text-sm font-medium',
          isActive ? 'text-rose-600' : 'text-zinc-600',
        )}
      >
        {feature.name}
      </h3>
      <p className="mt-2 font-display text-xl text-zinc-900">
        {feature.summary}
      </p>
      <p className="mt-4 text-sm text-zinc-600">{feature.description}</p>
    </div>
  )
}

function FeaturesMobile() {
  return (
    <div className="-mx-4 mt-20 flex flex-col gap-y-10 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:hidden">
      {features.map((feature) => (
        <div key={feature.summary}>
          <Feature feature={feature} className="mx-auto max-w-2xl" isActive />
        </div>
      ))}
    </div>
  )
}

function FeaturesDesktop() {
  return (
    <Tab.Group as="div" className="hidden lg:mt-20 lg:block">
      {({ selectedIndex }) => (
        <>
          <Tab.List className="grid grid-cols-3 gap-x-8">
            {features.map((feature, featureIndex) => (
              <Feature
                key={feature.summary}
                feature={{
                  ...feature,
                  name: (
                    <Tab className="ui-not-focus-visible:outline-none">
                      <span className="absolute inset-0" />
                      {feature.name}
                    </Tab>
                  ),
                }}
                isActive={featureIndex === selectedIndex}
                className="relative"
              />
            ))}
          </Tab.List>
        </>
      )}
    </Tab.Group>
  )
}

export function SecondaryFeatures() {
  return (
    <section
      id="secondary-features"
      aria-label="Features for simplifying everyday business tasks"
      className="pb-14 pt-20 sm:pb-20 sm:pt-32 lg:pb-32"
    >
      <Container>
        <div className="mx-auto max-w-2xl md:text-center">
          <h2 className="font-display text-3xl tracking-tight text-zinc-900 sm:text-4xl">
            Simplify everyday business tasks.
          </h2>
          <p className="mt-4 text-lg tracking-tight text-zinc-700">
            Because you’d probably be a little confused if we suggested you
            complicate your everyday business tasks instead.
          </p>
        </div>
        <FeaturesMobile />
        <FeaturesDesktop />
      </Container>
    </section>
  )
}
