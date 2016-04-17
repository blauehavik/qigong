module.exports = {

  db: process.env.MONGODB || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/stripe-membership',

  sessionSecret: process.env.SESSION_SECRET || 'change this',

  mailgun: {
    user: process.env.MAILGUN_USER || '',
    password: process.env.MAILGUN_PASSWORD || ''
  },

  stripeOptions: {
    apiKey: process.env.STRIPE_KEY || 'sk_test_FSCDbQ3CIcR8n1mkjZPzPvH5',
    stripePubKey: process.env.STRIPE_PUB_KEY || 'pk_test_f4YufbUltUu80ElxbCvbil4m',
    defaultPlan: 'free',
    plans: ['free', 'silver', 'gold', 'platinum'],
    planData: {
      'free': {
        name: 'Free',
        price: 0
      },
      'silver': {
        name: 'Silver',
        price: 9
      },
      'gold': {
        name: 'Gold',
        price: 19
      },
      'platinum': {
        name: 'Platinum',
        price: 29
      }
    }
  },

  googleAnalytics: process.env.GOOGLE_ANALYTICS || ''
};
