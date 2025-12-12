// BACKEND HOOK: This is sample data for demo purposes
// In production, this would be fetched from your ML pattern database

export const scamPatterns = [
  {
    id: '1',
    name: 'CEO Fraud / Executive Impersonation',
    description: 'Attacker impersonates company executive to authorize fraudulent wire transfers or request sensitive information.',
    severity: 'critical' as const,
    keywords: [
      'urgent',
      'wire transfer',
      'confidential',
      'CEO',
      'president',
      'executive',
      'immediate',
      'ASAP'
    ],
    phrases: [
      'need this right away',
      'wire the money',
      'don\'t tell anyone',
      'this is urgent',
      'handle this personally',
      'send the payment now',
      'I need you to do something',
      'keep this between us'
    ]
  },
  {
    id: '2',
    name: 'IT Support Credential Harvesting',
    description: 'Scammer poses as IT support to collect usernames, passwords, or remote access credentials.',
    severity: 'critical' as const,
    keywords: [
      'password',
      'IT support',
      'security update',
      'verify account',
      'reset password',
      'login credentials',
      'remote access',
      'TeamViewer',
      'AnyDesk'
    ],
    phrases: [
      'verify your password',
      'need to verify your account',
      'security breach',
      'your account has been compromised',
      'need your login',
      'reset your password',
      'install this software',
      'give me remote access',
      'what\'s your current password'
    ]
  },
  {
    id: '3',
    name: 'Urgent Account Verification',
    description: 'Creates false urgency claiming account issues require immediate verification of personal information.',
    severity: 'high' as const,
    keywords: [
      'verify',
      'suspended',
      'locked',
      'unusual activity',
      'security alert',
      'confirm',
      'validate',
      'account'
    ],
    phrases: [
      'your account will be suspended',
      'unusual activity detected',
      'verify your identity',
      'confirm your information',
      'account has been locked',
      'need to verify you',
      'security alert on your account',
      'click this link to verify'
    ]
  },
  {
    id: '4',
    name: 'Tax/IRS Impersonation',
    description: 'Impersonates tax authorities to threaten legal action and demand immediate payment.',
    severity: 'high' as const,
    keywords: [
      'IRS',
      'tax',
      'arrest',
      'warrant',
      'legal action',
      'lawsuit',
      'police',
      'investigation'
    ],
    phrases: [
      'you owe back taxes',
      'warrant for your arrest',
      'legal action will be taken',
      'this is the IRS',
      'final notice',
      'pay immediately',
      'avoid prosecution',
      'police will come'
    ]
  },
  {
    id: '5',
    name: 'Tech Support Scam',
    description: 'Claims computer has virus or security issue and offers fake tech support services.',
    severity: 'medium' as const,
    keywords: [
      'virus',
      'malware',
      'infected',
      'tech support',
      'Microsoft',
      'Windows',
      'Apple',
      'security',
      'firewall'
    ],
    phrases: [
      'your computer is infected',
      'detected a virus',
      'calling from Microsoft',
      'security breach detected',
      'your firewall is down',
      'need to fix your computer',
      'install this protection',
      'your warranty is expiring'
    ]
  },
  {
    id: '6',
    name: 'HR/Benefits Verification',
    description: 'Poses as HR to collect Social Security numbers, bank details for direct deposit, or other PII.',
    severity: 'critical' as const,
    keywords: [
      'HR',
      'human resources',
      'benefits',
      'payroll',
      'W2',
      'direct deposit',
      'social security',
      'SSN',
      'tax form'
    ],
    phrases: [
      'verify your social security',
      'update payroll information',
      'need your SSN',
      'confirm your direct deposit',
      'benefits enrollment',
      'update your W2',
      'verify your bank account',
      'need your date of birth'
    ]
  },
  {
    id: '7',
    name: 'Vendor Invoice Fraud',
    description: 'Impersonates known vendor to redirect payments to fraudulent accounts.',
    severity: 'high' as const,
    keywords: [
      'invoice',
      'payment',
      'vendor',
      'supplier',
      'account change',
      'bank details',
      'wire instructions',
      'routing number'
    ],
    phrases: [
      'updated our bank details',
      'new payment instructions',
      'change our account information',
      'please update your records',
      'send payment to new account',
      'our banking information changed',
      'use this routing number',
      'invoice needs to be paid'
    ]
  },
  {
    id: '8',
    name: 'Emergency Scam',
    description: 'Creates fake emergency scenario involving family member or colleague to pressure immediate action.',
    severity: 'high' as const,
    keywords: [
      'emergency',
      'accident',
      'hospital',
      'arrested',
      'stranded',
      'urgent help',
      'family member',
      'bail'
    ],
    phrases: [
      'family emergency',
      'been in an accident',
      'need money right away',
      'send cash immediately',
      'don\'t tell anyone',
      'stranded abroad',
      'need bail money',
      'please help me'
    ]
  }
];
