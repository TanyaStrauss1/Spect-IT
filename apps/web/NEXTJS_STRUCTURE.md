# Next.js 15 File Structure - Spect-IT

## Complete Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── layout.tsx          # Root layout with Header/Footer
│   │   ├── page.tsx            # Home page (Hero + sections)
│   │   ├── globals.css         # Global styles
│   │   ├── tests/              # Test pages
│   │   │   ├── page.tsx        # Tests overview
│   │   │   ├── acuity/        # Visual acuity test
│   │   │   │   └── page.tsx
│   │   │   ├── color/          # Color vision test
│   │   │   │   └── page.tsx
│   │   │   ├── astigmatism/    # Astigmatism test
│   │   │   │   └── page.tsx
│   │   │   ├── contrast/       # Contrast sensitivity
│   │   │   │   └── page.tsx
│   │   │   ├── visual-field/   # Visual field test
│   │   │   │   └── page.tsx
│   │   │   └── prescription/   # Prescription measurement
│   │   │       └── page.tsx
│   │   ├── dashboard/          # User dashboard
│   │   │   └── page.tsx
│   │   ├── marketplace/       # Marketplace
│   │   │   └── page.tsx
│   │   ├── specialists/       # Optometrist finder
│   │   │   └── page.tsx
│   │   ├── how-it-works/      # How it works page
│   │   │   └── page.tsx
│   │   ├── privacy/           # Privacy policy
│   │   │   └── page.tsx
│   │   ├── terms/             # Terms of service
│   │   │   └── page.tsx
│   │   └── medical-disclaimer/ # Medical disclaimer
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx     # Navigation header
│   │   │   └── Footer.tsx     # Footer with links
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx        # Hero with CTA
│   │   │   ├── HowItWorksSection.tsx  # 3-step guide
│   │   │   ├── TestGridSection.tsx    # Test cards
│   │   │   └── TrustSignalsSection.tsx # Trust indicators
│   │   ├── MedicalDisclaimer.tsx      # Medical warnings
│   │   ├── ScreeningExample.tsx       # Screening demo
│   │   └── ScreeningFunctionalExample.tsx
│   │
│   ├── hooks/
│   │   ├── useScreeningEngine.ts      # Functional API hook
│   │   ├── useScreeningModel.ts       # Class-based hook
│   │   └── useScreeningFunctional.ts  # Functional hook
│   │
│   └── lib/
│       ├── supabase.ts         # Supabase client
│       └── utils/              # Utility functions
│
├── public/
│   └── models/
│       └── screening/
│           └── model.json     # TensorFlow.js model
│
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Key Features

### ✅ World-Class Structure
- Clean separation of concerns
- Reusable components
- Type-safe throughout
- Performance optimized

### ✅ Medical-Grade
- Clear disclaimers
- Validation status
- Trust signals
- Privacy-first

### ✅ Accessibility
- WCAG compliant
- Keyboard navigation
- Screen reader friendly
- High contrast

### ✅ Performance
- Code splitting
- Lazy loading
- Optimized images
- Fast page loads

