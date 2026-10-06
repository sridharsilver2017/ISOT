// Speaker & Faculty Photo Mapping Utility

export const SPEAKER_PHOTOS: Record<string, string> = {
  // Council & Leadership
  'sanjay-kolte': '/speaker-photos/sanjay-kolte.png',
  'dr-sanjay-kolte': '/speaker-photos/sanjay-kolte.png',
  'arpita-ray-chaudhury': '/speaker-photos/arpita-ray-chaudhury.png',
  'dr-arpita-ray-chaudhury': '/speaker-photos/arpita-ray-chaudhury.png',
  'dhananjai-agarwal': '/speaker-photos/dhananjai-agarwal.png',
  'dhannanjay-agarwal': '/speaker-photos/dhananjai-agarwal.png',
  'dhananjay-agarwal': '/speaker-photos/dhananjai-agarwal.png',
  'dr-dhananjai-agarwal': '/speaker-photos/dhananjai-agarwal.png',
  'manish-balwani': '/speaker-photos/manish-balwani.jpeg',
  'manish-r-balwani': '/speaker-photos/manish-balwani.jpeg',
  'dr-manish-r-balwani': '/speaker-photos/manish-balwani.jpeg',
  'krishna-v-patil': '/speaker-photos/krishna-v-patil.JPG',
  'dr-krishna-v-patil': '/speaker-photos/krishna-v-patil.JPG',
  'krishnavpatil': '/speaker-photos/krishna-v-patil.JPG',
  'dhananjaya-k-l': '/speaker-photos/dhananjaya-k-l.JPG',
  'dr-dhananjaya-k-l': '/speaker-photos/dhananjaya-k-l.JPG',
  'sanjay-kumar-agarwal': '/speaker-photos/sanjay-kumar-agarwal.png',
  'dr-sanjay-kumar-agarwal': '/speaker-photos/sanjay-kumar-agarwal.png',
  'sourabh-sharma': '/speaker-photos/sourabh-sharma.png',
  'dr-sourabh-sharma': '/speaker-photos/sourabh-sharma.png',

  // Keynote & Dignitaries
  'vinod-kumar-paul': '/speaker-photos/vinod-kumar-paul.png',
  'vk-paul': '/speaker-photos/vk-paul.png',
  'v-k-paul': '/speaker-photos/vk-paul.png',
  'atul-goel': '/speaker-photos/atul-goel.png',
  'dr-atul-goel': '/speaker-photos/atul-goel.png',

  // Faculty Speakers, Chairpersons & Panelists
  'sunil-shroff': '/speaker-photos/sunil-shroff.png',
  'dr-sunil-shroff': '/speaker-photos/sunil-shroff.png',
  'anup-barman': '/speaker-photos/anup-barman.jpg',
  'dr-anup-barman': '/speaker-photos/anup-barman.jpg',
  'shiny-suman-pradhan': '/speaker-photos/shiny-suman-pradhan.png',
  'shiny-pradhan': '/speaker-photos/shiny-pradhan.png',
  'awadhesh-kumar-yadav': '/speaker-photos/awadhesh-kumar-yadav.png',
  'sharadalekha-guditi': '/speaker-photos/sharadalekha-guditi.png',
  'swarnalatha-guditi': '/speaker-photos/swarnalatha-guditi.png',
  'swarnalatha-g': '/speaker-photos/swarnalatha-g.png',
  'rajani-m': '/speaker-photos/rajani-m.png',
  'natarajan-gopalakrishnan': '/speaker-photos/natarajan-gopalakrishnan.png',
  'yogaram-jabble': '/speaker-photos/yogaram-jabble.png',
  'pranab-modi': '/speaker-photos/pranab-modi.png',
  'pranav-modi': '/speaker-photos/pranav-modi.png',
  'geetesh-ms': '/speaker-photos/geetesh-ms.png',
  'gireesh-ms': '/speaker-photos/gireesh-ms.png',
  'jayesh-sachde': '/speaker-photos/jayesh-sachde.png',
  'manish-singhshikha': '/speaker-photos/manish-singhshikha.png',
  'manish-shrigiriwa': '/speaker-photos/manish-shrigiriwa.png',
  'raj-kanwar-yadav': '/speaker-photos/raj-kanwar-yadav.png',
  'raj-kumar-yadav': '/speaker-photos/raj-kumar-yadav.png',
  'sanjay-nagral': '/speaker-photos/sanjay-nagral.png',
  'dr-sanjay-nagral': '/speaker-photos/sanjay-nagral.png',
  'sunil-vasudevan': '/speaker-photos/sunil-vasudevan.png',
  'allan-massie': '/speaker-photos/allan-massie.png',
  'maria-paula-gomez': '/speaker-photos/maria-paula-gomez.png',
  'marcello-cantarovich': '/speaker-photos/marcello-cantarovich.png',
  'ashish-shahas': '/speaker-photos/ashish-shahas.png',
  'ashish-sharma': '/speaker-photos/ashish-sharma.png',
  'dilipdada-deshmukh': '/speaker-photos/dilipdada-deshmukh.png',
  'dilip-deshmukh': '/speaker-photos/dilip-deshmukh.png',
  'nilesh-mandlewal': '/speaker-photos/nilesh-mandlewal.png',
  'rakesh-joshi': '/speaker-photos/rakesh-joshi.png',
};

export const normalizeSpeakerKey = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/^dr\.?\s+/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getSpeakerPhoto = (nameOrSlug?: string): string | undefined => {
  if (!nameOrSlug) return undefined;
  const key = normalizeSpeakerKey(nameOrSlug);
  if (SPEAKER_PHOTOS[key]) {
    return SPEAKER_PHOTOS[key];
  }
  // Try prefixed or raw
  const rawKey = nameOrSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  return SPEAKER_PHOTOS[rawKey];
};
