import { CouncilMember } from '../types/programme';

export const EVENT_DETAILS = {
  name: 'ISOT 2026',
  fullTitle: '36th Annual Conference of the Indian Society of Organ Transplantation',
  society: 'Indian Society of Organ Transplantation (ISOT)',
  datesDisplay: '9–11 October 2026',
  startDate: '2026-10-09',
  endDate: '2026-10-11',
  venue: 'HITEX Convention Center',
  venueFull: 'Hyderabad International Trade Exposition & Convention Center (HITEX), Hyderabad, India',
  city: 'Hyderabad, India',
  theme: 'Shaping the Future of Transplantation: Innovation, Collaboration & Excellence',
  themeSubtitle: 'Innovation, Collaboration & Excellence',
  organizedBy: 'Kidney Health Trust of Telangana',
  website: 'www.isot2026.com',
  websiteUrl: 'https://www.isot2026.com',
  organizingSecretaries: [
    {
      name: 'Dr Dhananjaya K L',
      affiliation: 'Continental Hospitals, Gachibowli, Hyderabad',
      role: 'Organizing Secretary'
    },
    {
      name: 'Dr Krishna V Patil',
      affiliation: 'Shri Balaji Kidney Care Clinic, Hyderabad, Telangana 500081',
      role: 'Organizing Secretary'
    }
  ],
  congressSecretariat: {
    contactPerson: 'Mr. Thirupathi Atkapuram, CEM',
    title: 'Director – Operations & BD',
    company: 'Meety Events Private Limited',
    address: 'Office No.207, 2nd Floor, HITEX TFO Building, Izzathnagar, Hyderabad - 500084, Telangana, India',
  },
  pco: {
    name: 'Meety Events Private Limited',
    description: 'Professional Conference Organiser',
  },
  specialEvents: [
    {
      day: 'Friday, 09 October 2026',
      time: '18:00 – 19:00',
      title: 'GBM for ISOT members only',
      venue: 'Hall B – Screen 2 / Hall A',
      type: 'gbm',
      note: 'General Body Meeting exclusive for registered ISOT members.'
    },
    {
      day: 'Friday, 09 October 2026',
      time: '20:00 – 22:00',
      title: 'ISOT Gala Dinner & Networking',
      venue: 'HITEX Lawns / Banquet Area',
      type: 'dinner',
      note: 'An evening of networking, culinary delights and cultural celebration.'
    },
    {
      day: 'Saturday, 10 October 2026',
      time: '18:30 onwards',
      title: 'ISOT General Body Meeting (GBM)',
      venue: 'Hall A / Hall C',
      type: 'gbm',
      note: 'Annual General Body Meeting for ISOT members.'
    },
    {
      day: 'Saturday, 10 October 2026',
      time: '20:00 – 22:00',
      title: 'Grand Conference Gala Dinner',
      venue: 'HITEX Grand Ballroom / Open Lawns',
      type: 'dinner',
      note: 'Celebratory conference banquet and entertainment.'
    },
    {
      day: 'Sunday, 11 October 2026',
      time: '13:15 / 13:30 – 14:00',
      title: 'Valedictory Function & Awards Ceremony',
      venue: 'Hall A / Plenary Halls',
      type: 'ceremony',
      note: 'Concluding ceremony, award presentations, and valediction.'
    },
    {
      day: 'Sunday, 11 October 2026',
      time: '14:00 onwards',
      title: 'Farewell Lunch',
      venue: 'HITEX Dining Area',
      type: 'lunch',
      note: 'Farewell lunch for all registered delegates and faculty.'
    }
  ]
};

export const ISOT_COUNCIL: CouncilMember[] = [
  { name: 'Dr Sanjay Kolte', designation: 'President' },
  { name: 'Dr Arpita Ray Chaudhury', designation: 'Past President' },
  { name: 'Dr. Dhananjai Agarwal', designation: 'President Elect (Physician)' },
  { name: 'Dr Vikas Jain', designation: 'Vice President (Surgeon) 2025-2026' },
  { name: 'Dr Debasis Das', designation: 'Vice President (Surgeon) 2026-2027' },
  { name: 'Dr Sanjay Kumar Agarwal', designation: 'Vice President (Physician)' },
  { name: 'Dr Vrushali Deshpande', designation: 'Vice President (Basic Science)' },
  { name: 'Dr Manish R Balwani', designation: 'Honorary Secretary' },
  { name: 'Dr Jigar Shrimali', designation: 'Joint Secretary' },
  { name: 'Dr Vivek Kute', designation: 'Treasurer' },
  { name: 'Dr Subho Banerjee', designation: 'Council' },
  { name: 'Dr Sourabh Sharma', designation: 'Council' },
  { name: 'Dr Pratik Das', designation: 'Council' },
  { name: 'Dr Divyesh Engineer', designation: 'Council' },
  { name: 'Dr Umapati Hegde', designation: 'Council' },
  { name: 'Dr Amol Bhawane', designation: 'Council' },
  { name: 'Dr Sreebhushan Raju', designation: 'Council' },
  { name: 'Dr Shruti Tapiawala', designation: 'Council' },
  { name: 'Dr Narayan Prasad', designation: 'EIC IJT' },
];

export const CONFERENCE_DAYS = [
  {
    date: '2026-10-09',
    dayName: 'Friday',
    dayFormatted: '09 October',
    fullDisplay: 'Friday, 09 October 2026',
    sessionsCount: 6,
  },
  {
    date: '2026-10-10',
    dayName: 'Saturday',
    dayFormatted: '10 October',
    fullDisplay: 'Saturday, 10 October 2026',
    sessionsCount: 9,
  },
  {
    date: '2026-10-11',
    dayName: 'Sunday',
    dayFormatted: '11 October',
    fullDisplay: 'Sunday, 11 October 2026',
    sessionsCount: 4,
  },
];
