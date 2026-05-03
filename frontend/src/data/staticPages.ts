export interface StaticPageSection {
  heading: string;
  content: string;
}

export interface StaticPageData {
  title: string;
  description: string;
  icon: string; // Material Symbol name
  sections: StaticPageSection[];
}

export const staticPages: Record<string, StaticPageData> = {
  about: {
    title: 'About AstroVerse',
    description:
      'AstroVerse is a modern astrology platform that combines ancient wisdom with cutting-edge technology to deliver personalized cosmic insights.',
    icon: 'auto_awesome',
    sections: [
      {
        heading: 'Our Mission',
        content:
          'AstroVerse was founded with a simple belief: astrology should be accessible, accurate, and deeply personal. We bridge the gap between traditional astrological practice and modern technology, making professional-grade natal chart analysis available to everyone.\n\nOur team of astrologers, astronomers, and engineers has built a platform that honors the rich tradition of astrology while leveraging computational precision that was previously impossible.',
      },
      {
        heading: 'What Sets Us Apart',
        content:
          'Unlike generic horoscope apps, AstroVerse generates true natal charts using Swiss Ephemeris data -- the same astronomical calculation engine trusted by professional astrologers worldwide. Every chart accounts for exact birth time, latitude, longitude, and timezone to produce accurate planetary positions and house placements.\n\nWe also offer AI-enhanced interpretations that synthesize traditional astrological knowledge with personalized context, giving you insights that resonate with your unique life experience.',
      },
      {
        heading: 'Our Story',
        content:
          'AstroVerse began as a passion project in 2024, born from the frustration of seeing astrology reduced to generic sun-sign descriptions. Our founders believed that everyone deserves access to the depth and nuance of a real astrological reading.\n\nToday, AstroVerse serves thousands of users across the globe, from curious beginners to seasoned practitioners. We continue to expand our features while staying true to our founding principle: astrology is a tool for self-understanding, and it should treat every individual as unique.',
      },
    ],
  },

  features: {
    title: 'Platform Features',
    description:
      'Explore the tools and capabilities that make AstroVerse the most comprehensive astrology platform available.',
    icon: 'grid_view',
    sections: [
      {
        heading: 'Natal Chart Generation',
        content:
          'Create detailed birth charts with precise planetary positions, house cusps, and aspect patterns. Our engine uses Swiss Ephemeris data for astronomical accuracy, supporting all major house systems including Placidus, Koch, Equal, and Whole Sign.\n\nCharts display the Sun, Moon, and all eight major planets plus Chiron, the Lunar Nodes, and Part of Fortune -- with exact degrees and retrograde status clearly indicated.',
      },
      {
        heading: 'Personality Analysis & AI Interpretation',
        content:
          'Go beyond the chart wheel with comprehensive personality breakdowns. AstroVerse analyzes planetary placements, house positions, and aspect patterns to generate layered interpretations of your strengths, challenges, and life themes.\n\nOur optional AI-enhanced interpretation feature synthesizes all chart factors into a cohesive narrative, offering the depth of a professional reading at your convenience.',
      },
      {
        heading: 'Transit Tracking & Forecasting',
        content:
          'Stay aligned with cosmic currents through real-time transit tracking. See which planets are currently activating your natal chart, with detailed descriptions of each transit\'s influence and timing.\n\nDaily weather reports, weekly forecasts, and long-range transit calendars help you plan around significant astrological events and make the most of favorable periods.',
      },
      {
        heading: 'Synastry & Relationship Astrology',
        content:
          'Compare two charts to explore relationship dynamics. Our synastry calculator overlays planetary positions to reveal areas of harmony, tension, and growth between partners, friends, or family members.\n\nCompatibility scores, aspect analysis, and house overlays provide a multidimensional view of any relationship\'s astrological blueprint.',
      },
    ],
  },

  pricing: {
    title: 'Pricing',
    description:
      'AstroVerse offers flexible plans to suit every level of astrological interest, from casual exploration to deep professional analysis.',
    icon: 'credit_card',
    sections: [
      {
        heading: 'Free Tier',
        content:
          'Get started with AstroVerse at no cost. The free tier includes:\n\n- Up to 3 saved natal charts\n- Basic chart wheel visualization\n- Sun, Moon, and Rising sign summaries\n- Daily cosmic weather overview\n- Access to the astrological calendar\n\nNo credit card required. Create an account and start exploring immediately.',
      },
      {
        heading: 'Pro Subscription',
        content:
          'Unlock the full power of AstroVerse with a Pro plan:\n\n- Unlimited saved natal charts\n- Full personality analysis with AI interpretation\n- Real-time transit tracking and alerts\n- Synastry and compatibility reports\n- Solar and Lunar return charts\n- Calendar export (Google Calendar, iCal)\n- Priority support\n\nVisit your account settings to view current pricing and start a free trial.',
      },
      {
        heading: 'Enterprise & API Access',
        content:
          'For astrologers, wellness platforms, and businesses seeking to integrate AstroVerse capabilities into their own products, we offer API access with custom licensing.\n\nContact our team for enterprise pricing, SLA details, and integration support.',
      },
    ],
  },

  api: {
    title: 'API Documentation',
    description:
      'Integrate AstroVerse chart calculation and interpretation capabilities into your own applications.',
    icon: 'code',
    sections: [
      {
        heading: 'Overview',
        content:
          'The AstroVerse API provides programmatic access to our chart calculation engine, transit computations, and interpretation services. Built on RESTful principles, the API returns structured JSON responses suitable for web, mobile, and desktop applications.\n\nAPI access is available to Pro subscribers and enterprise partners. All requests require authentication via JWT tokens issued through the AstroVerse authorization flow.',
      },
      {
        heading: 'Core Endpoints',
        content:
          'Charts: Generate natal charts by providing birth date, time, and location. Receive planetary positions, house cusps, aspects, and interpretation text.\n\nTransits: Query current or historical planetary transits against a saved natal chart. Filter by planet, aspect type, or orb tolerance.\n\nSynastry: Submit two sets of birth data to receive a full synastry report with compatibility scores and aspect analysis.\n\nInterpretations: Request AI-enhanced interpretations for any chart factor -- a single placement, an aspect, or a complete chart synthesis.',
      },
      {
        heading: 'Getting Started',
        content:
          'To begin using the AstroVerse API:\n\n1. Create an AstroVerse account and subscribe to a Pro or Enterprise plan.\n2. Generate an API key from your account settings.\n3. Review the full API reference documentation for endpoint details, request schemas, and response formats.\n4. Use our official client libraries (JavaScript/TypeScript available; Python coming soon) for rapid integration.\n\nRate limits and usage quotas apply based on your subscription tier. Visit your dashboard to monitor usage.',
      },
    ],
  },

  blog: {
    title: 'AstroVerse Blog',
    description:
      'Insights, tutorials, and cosmic updates from the AstroVerse team and guest astrologers.',
    icon: 'menu_book',
    sections: [
      {
        heading: 'Latest Articles',
        content:
          'Stay informed with regularly published articles covering:\n\n- Planetary transit guides and what to expect during major shifts\n- Beginner-friendly tutorials on reading your natal chart\n- Deep dives into specific astrological concepts (houses, aspects, retrogrades)\n- Seasonal forecasts and monthly cosmic weather reports\n- Interviews with professional astrologers and researchers\n\nNew articles are published weekly. Bookmark this page or subscribe to our newsletter for updates.',
      },
      {
        heading: 'Contributing',
        content:
          'We welcome guest contributions from experienced astrologers and astrology writers. If you have a topic you are passionate about, we would love to hear from you.\n\nArticles should be original, well-researched, and accessible to a general audience. We particularly welcome pieces that help readers apply astrological insights to their daily lives.\n\nContact our editorial team via the contact page with your article proposal.',
      },
    ],
  },

  support: {
    title: 'Help & Support',
    description:
      'Find answers to common questions and get the help you need to make the most of AstroVerse.',
    icon: 'help',
    sections: [
      {
        heading: 'Frequently Asked Questions',
        content:
          'Q: How accurate are the charts?\nA: AstroVerse uses the Swiss Ephemeris, the gold standard for astronomical calculations. Charts are accurate to within arc-minutes, provided the birth data you enter is correct.\n\nQ: What house system does AstroVerse use?\nA: By default, we use the Placidus house system. You can switch to Koch, Equal, or Whole Sign in your chart settings.\n\nQ: Can I edit a chart after creating it?\nA: Yes. Navigate to your saved charts, select the chart, and use the edit function to update birth data.\n\nQ: How do I export my transits to my calendar?\nA: Open the transit calendar view and use the export button to generate a file compatible with Google Calendar, Apple Calendar, or any iCal-compatible application.',
      },
      {
        heading: 'Contacting Support',
        content:
          'If you cannot find the answer you need, our support team is here to help.\n\n- Email: support@astroverse.app\n- Response time: within 24 hours on business days\n- Pro subscribers receive priority support with faster response times\n\nWhen contacting support, please include your account email and a detailed description of the issue. Screenshots are always helpful.',
      },
      {
        heading: 'Known Issues & Status',
        content:
          'Check our status page for real-time information about platform availability and any ongoing incidents.\n\nWe perform scheduled maintenance on the first Sunday of each month between 2:00 AM and 4:00 AM UTC. During this window, some features may be temporarily unavailable.',
      },
    ],
  },

  careers: {
    title: 'Careers at AstroVerse',
    description:
      'Join our team and help build the future of accessible, technology-driven astrology.',
    icon: 'work',
    sections: [
      {
        heading: 'Why AstroVerse',
        content:
          'AstroVerse sits at the intersection of ancient wisdom and modern technology. Our team is passionate about making astrology meaningful, accurate, and accessible to millions.\n\nWe are a remote-first company with a culture that values curiosity, continuous learning, and thoughtful design. Team members are encouraged to explore their interests in astrology, astronomy, psychology, and technology.\n\nWe offer competitive compensation, flexible schedules, professional development budgets, and the freedom to work from anywhere.',
      },
      {
        heading: 'Open Positions',
        content:
          'We are always looking for talented individuals in the following areas:\n\n- Frontend Engineering (React, TypeScript)\n- Backend Engineering (Node.js, PostgreSQL)\n- Astrology Content & Interpretation\n- UX/UI Design\n- Data Science & Machine Learning\n- DevOps & Infrastructure\n\nEven if you do not see a specific role listed, we encourage you to reach out. We hire for potential and passion as much as for specific skill sets.',
      },
      {
        heading: 'How to Apply',
        content:
          'Send your resume and a brief note about why AstroVerse interests you to careers@astroverse.app.\n\nWe review every application personally. Our process typically includes an initial conversation, a skills-focused discussion, and a final team interview. We aim to respond to all applicants within one week.',
      },
    ],
  },

  contact: {
    title: 'Contact Us',
    description:
      'We would love to hear from you. Reach out with questions, feedback, or partnership inquiries.',
    icon: 'mail',
    sections: [
      {
        heading: 'General Inquiries',
        content:
          'For questions about AstroVerse features, account issues, or general feedback:\n\nEmail: hello@astroverse.app\n\nWe aim to respond within one business day.',
      },
      {
        heading: 'Technical Support',
        content:
          'For bugs, errors, or technical difficulties:\n\nEmail: support@astroverse.app\n\nPlease include your account email, the browser or device you are using, and steps to reproduce the issue. Screenshots or screen recordings help us resolve problems faster.',
      },
      {
        heading: 'Partnerships & Press',
        content:
          'For business partnerships, API licensing, media inquiries, or press coverage:\n\nEmail: partnerships@astroverse.app\n\nWe are open to collaborations with astrology educators, wellness platforms, content creators, and technology partners.',
      },
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    description:
      'Your privacy is important to us. This policy explains how AstroVerse collects, uses, and protects your personal information.',
    icon: 'shield',
    sections: [
      {
        heading: 'Information We Collect',
        content:
          'AstroVerse collects the following categories of information:\n\n- Account information: email address, display name, and password (stored as a hashed value).\n- Birth data: date, time, and location of birth. This data is essential for generating accurate astrological charts.\n- Usage data: pages visited, features used, and general interaction patterns. This helps us improve the platform.\n- Device information: browser type, operating system, and screen resolution for optimization purposes.\n\nWe do not sell your personal information to third parties.',
      },
      {
        heading: 'How We Use Your Information',
        content:
          'Your information is used to:\n\n- Generate and store your astrological charts and interpretations.\n- Provide personalized transit notifications and forecasts.\n- Maintain your account and authenticate your sessions.\n- Communicate important updates about your account or the platform.\n- Analyze aggregate usage patterns to improve AstroVerse features and performance.\n\nWe process birth data solely to calculate astrological charts. This data is never used for advertising or shared with data brokers.',
      },
      {
        heading: 'Data Security & Your Rights',
        content:
          'We implement industry-standard security measures including encryption in transit (TLS 1.3), encrypted data storage, and regular security audits.\n\nYou have the right to:\n- Access all personal data we hold about you.\n- Request correction of inaccurate data.\n- Delete your account and all associated data at any time.\n- Export your charts and data in a portable format.\n\nTo exercise any of these rights, contact privacy@astroverse.app or use the account settings page.',
      },
      {
        heading: 'Contact',
        content:
          'For privacy-related questions or concerns, contact our Data Protection Officer at privacy@astroverse.app.\n\nThis privacy policy was last updated on March 1, 2026. We will notify users of any material changes via email or platform notification.',
      },
    ],
  },

  terms: {
    title: 'Terms of Service',
    description:
      'By using AstroVerse, you agree to the following terms and conditions. Please read them carefully.',
    icon: 'description',
    sections: [
      {
        heading: 'Acceptance of Terms',
        content:
          'By accessing or using the AstroVerse platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the platform.\n\nThese terms apply to all users, including free-tier and subscribed accounts. AstroVerse reserves the right to update these terms at any time, with notice provided via email or platform notification.',
      },
      {
        heading: 'Use of Service',
        content:
          'AstroVerse provides astrological chart calculation, interpretation, and forecasting tools for personal and educational use. You agree to:\n\n- Provide accurate birth data to the best of your knowledge.\n- Not use the platform for any unlawful purpose.\n- Not attempt to reverse-engineer, scrape, or otherwise extract data from the platform beyond authorized API access.\n- Not share your account credentials with others.\n- Respect rate limits and usage quotas associated with your subscription tier.\n\nAstroVerse reserves the right to suspend or terminate accounts that violate these terms.',
      },
      {
        heading: 'Disclaimer',
        content:
          'AstroVerse provides astrological information and interpretations for entertainment and self-reflection purposes. Astrology is not a science, and our interpretations should not be treated as professional psychological, medical, legal, or financial advice.\n\nWhile we strive for astronomical accuracy in chart calculations, we cannot guarantee the accuracy of interpretations, which are inherently subjective. Users are encouraged to use their own judgment and consult qualified professionals for important life decisions.',
      },
      {
        heading: 'Intellectual Property',
        content:
          'All content, design, and software on the AstroVerse platform is the intellectual property of AstroVerse or its licensors. This includes but is not limited to text, graphics, logos, icons, code, and the overall design of the platform.\n\nYou may share your personal chart results and interpretations for non-commercial purposes with proper attribution. Commercial redistribution of AstroVerse content requires written permission.',
      },
    ],
  },

  cookies: {
    title: 'Cookie Policy',
    description:
      'This policy explains how AstroVerse uses cookies and similar tracking technologies.',
    icon: 'cookie',
    sections: [
      {
        heading: 'What Are Cookies',
        content:
          'Cookies are small text files stored on your device when you visit a website. They serve various purposes, from remembering your preferences to enabling essential functionality.\n\nAstroVerse uses cookies and similar technologies (such as localStorage and session storage) to operate the platform securely and provide a personalized experience.',
      },
      {
        heading: 'How AstroVerse Uses Cookies',
        content:
          'Essential cookies: These are required for the platform to function. They include session authentication tokens, CSRF protection tokens, and user preference settings (such as dark mode). You cannot opt out of essential cookies without losing platform functionality.\n\nAnalytics cookies: We use analytics to understand how users interact with AstroVerse, which features are most valued, and where we can improve. Analytics data is aggregated and anonymized.\n\nWe do not use advertising cookies or tracking pixels from third-party ad networks.',
      },
      {
        heading: 'Managing Your Preferences',
        content:
          'You can manage cookie preferences through your browser settings. Most browsers allow you to block or delete cookies, though blocking essential cookies will prevent AstroVerse from working correctly.\n\nIf you have questions about specific cookies or would like to request more detail about our data practices, contact privacy@astroverse.app.\n\nThis cookie policy was last updated on March 1, 2026.',
      },
    ],
  },
};
