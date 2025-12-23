export type SourceSite = {
  site: string; // domain only (for site: search)
  label: string;
  kind: 'FR' | 'IT' | 'DE' | 'ES' | 'PL' | 'EU';
};

export type BrandSource = {
  brand: string;
  country: string;
  aliases?: string[]; // match helpers (lowercase)
  primary: SourceSite[]; // show first
  backup?: SourceSite[]; // show later
};

/**
 * NOTE:
 * - FR: Easypara + Cocooncenter are the most consistently cheap & legit for FR dermocosmetics.
 * - IT: Farmaè + AmicaFarmacia + 1000Farmacie are great for price hunting.
 * - DE: Shop-Apotheke is usually best; DocMorris as backup. dm/rossmann for mass-market.
 * - ES: Atida/Mifarma strong on ISDIN etc.
 * - EU: Notino is strong for many cosmetics/hair; Atida/Mifarma cover multiple EU markets.
 */
export const BRAND_SOURCES: Record<string, BrandSource> = {
  // =========================
  // 🇫🇷 FRANCE — dermocosmetics (საქართველოში ყველაზე მოთხოვნადი)
  // =========================
  'La Roche-Posay': {
    brand: 'La Roche-Posay',
    country: 'France',
    aliases: ['la roche posay', 'larocheposay', 'lrp', 'ლა როშ', 'ლა როშ პოზე', 'ლა როში', 'ლაროშ'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ],
    backup: [{ site: 'santediscount.com', label: 'Santédiscount (FR)', kind: 'FR' }]
  },

  Vichy: {
    brand: 'Vichy',
    country: 'France',
    aliases: ['vichy', 'ვიში', 'vishi'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ],
    backup: [{ site: 'santediscount.com', label: 'Santédiscount (FR)', kind: 'FR' }]
  },

  Caudalie: {
    brand: 'Caudalie',
    country: 'France',
    aliases: ['caudalie', 'კოდალი', 'ქოდალი'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ],
    backup: [{ site: 'santediscount.com', label: 'Santédiscount (FR)', kind: 'FR' }]
  },

  Bioderma: {
    brand: 'Bioderma',
    country: 'France',
    aliases: ['bioderma', 'ბიოდერმა'],
    primary: [
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' },
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' }
    ],
    backup: [{ site: 'santediscount.com', label: 'Santédiscount (FR)', kind: 'FR' }]
  },

  'Avène': {
    brand: 'Avène',
    country: 'France',
    aliases: ['avene', 'avène', 'avéne', 'ავენ', 'ავენი'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'santediscount.com', label: 'Santédiscount (FR)', kind: 'FR' }
    ],
    backup: [{ site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }]
  },

  Uriage: {
    brand: 'Uriage',
    country: 'France',
    aliases: ['uriage', 'ურიაჟი'],
    primary: [
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' },
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' }
    ]
  },

  SVR: {
    brand: 'SVR',
    country: 'France',
    aliases: ['svr', 'ესვიარ', 'სვრ'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ]
  },

  Ducray: {
    brand: 'Ducray',
    country: 'France',
    aliases: ['ducray', 'დუკრე'],
    primary: [
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' },
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' }
    ]
  },

  Klorane: {
    brand: 'Klorane',
    country: 'France',
    aliases: ['klorane', 'კლორანი'],
    primary: [
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' },
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' }
    ]
  },

  Nuxe: {
    brand: 'Nuxe',
    country: 'France',
    aliases: ['nuxe', 'ნუქსი'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ]
  },

  Mustela: {
    brand: 'Mustela',
    country: 'France',
    aliases: ['mustela', 'მუსტელა'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ]
  },

  Noreva: {
    brand: 'Noreva',
    country: 'France',
    aliases: ['noreva', 'ნორევა'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ],
    backup: [{ site: 'farmae.it', label: 'Farmaè (IT)', kind: 'IT' }]
  },

  Embryolisse: {
    brand: 'Embryolisse',
    country: 'France',
    aliases: ['embryolisse', 'ემბრიოლისი'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ]
  },

  Topicrem: {
    brand: 'Topicrem',
    country: 'France',
    aliases: ['topicrem', 'ტოპიკრემი'],
    primary: [{ site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }],
    backup: [{ site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' }]
  },

  Filorga: {
    brand: 'Filorga',
    country: 'France',
    aliases: ['filorga', 'ფილორგა'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ]
  },

  Darphin: {
    brand: 'Darphin',
    country: 'France',
    aliases: ['darphin'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ]
  },

  Lierac: {
    brand: 'Lierac',
    country: 'France',
    aliases: ['lierac', 'ლიერაკი'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ]
  },

  'René Furterer': {
    brand: 'René Furterer',
    country: 'France',
    aliases: ['rene furterer', 'rené furterer', 'furterer'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ]
  },

  Phyto: {
    brand: 'Phyto',
    country: 'France',
    aliases: ['phyto'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ]
  },

  Biafine: {
    brand: 'Biafine',
    country: 'France',
    aliases: ['biafine'],
    primary: [{ site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' }]
  },

  'A-Derma': {
    brand: 'A-Derma',
    country: 'France',
    aliases: ['a-derma', 'aderma', 'ა დერმა', 'ადერმა'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ]
  },

  'Uriage (FR alt)': {
    brand: 'Uriage',
    country: 'France',
    aliases: ['uriage alt'],
    primary: [{ site: 'santediscount.com', label: 'Santédiscount (FR)', kind: 'FR' }]
  },

  'Esthederm': {
    brand: 'Institut Esthederm',
    country: 'France',
    aliases: ['esthederm', 'institut esthederm'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ],
    backup: [{ site: 'santediscount.com', label: 'Santédiscount (FR)', kind: 'FR' }]
  },

  'ISISPHARMA': {
    brand: 'ISISPHARMA',
    country: 'France',
    aliases: ['isis', 'isispharma', 'isis pharma'],
    primary: [
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' },
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' }
    ]
  },

  'Bepanthen (FR retail)': {
    brand: 'Bepanthen',
    country: 'Germany (often sold EU-wide)',
    aliases: ['bepanthen'],
    primary: [{ site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' }]
  },

  // =========================
  // 🇩🇪 GERMANY — pharmacy / daily care
  // =========================
  Eucerin: {
    brand: 'Eucerin',
    country: 'Germany',
    aliases: ['eucerin', 'ეუცერინ'],
    primary: [
      { site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' },
      { site: 'medpex.de', label: 'medpex (DE)', kind: 'DE' }
    ],
    backup: [{ site: 'docmorris.de', label: 'DocMorris (DE)', kind: 'DE' }]
  },

  Bepanthen: {
    brand: 'Bepanthen',
    country: 'Germany',
    aliases: ['bepanthen', 'ბეპანტენი'],
    primary: [{ site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' }],
    backup: [{ site: 'docmorris.de', label: 'DocMorris (DE)', kind: 'DE' }]
  },

  Weleda: {
    brand: 'Weleda',
    country: 'Germany/Switzerland',
    aliases: ['weleda'],
    primary: [{ site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' }],
    backup: [
      { site: 'dm.de', label: 'dm (DE)', kind: 'DE' },
      { site: 'rossmann.de', label: 'Rossmann (DE)', kind: 'DE' }
    ]
  },

  Sebamed: {
    brand: 'Sebamed',
    country: 'Germany',
    aliases: ['sebamed'],
    primary: [{ site: 'dm.de', label: 'dm (DE)', kind: 'DE' }],
    backup: [{ site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' }]
  },

  'CeraVe': {
    brand: 'CeraVe',
    country: 'EU retail (often cheaper DE/FR)',
    aliases: ['cerave', 'cera ve', 'სერავე'],
    primary: [
      { site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' },
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' }
    ],
    backup: [{ site: 'rossmann.de', label: 'Rossmann (DE)', kind: 'DE' }]
  },

  'Cetaphil': {
    brand: 'Cetaphil',
    country: 'EU retail (often DE)',
    aliases: ['cetaphil', 'სეტაფილი'],
    primary: [{ site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' }],
    backup: [{ site: 'docmorris.de', label: 'DocMorris (DE)', kind: 'DE' }]
  },

  'Neutrogena': {
    brand: 'Neutrogena',
    country: 'EU retail (often DE)',
    aliases: ['neutrogena', 'ნეუტროჯენა'],
    primary: [
      { site: 'dm.de', label: 'dm (DE)', kind: 'DE' },
      { site: 'rossmann.de', label: 'Rossmann (DE)', kind: 'DE' }
    ],
    backup: [{ site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' }]
  },

  'Vaseline': {
    brand: 'Vaseline',
    country: 'EU retail (often DE)',
    aliases: ['vaseline', 'ვაზელინი'],
    primary: [
      { site: 'dm.de', label: 'dm (DE)', kind: 'DE' },
      { site: 'rossmann.de', label: 'Rossmann (DE)', kind: 'DE' }
    ]
  },

  'Perspirex': {
    brand: 'Perspirex',
    country: 'Denmark (EU retail)',
    aliases: ['perspirex', 'პერსპირექსი'],
    primary: [{ site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' }],
    backup: [{ site: 'docmorris.de', label: 'DocMorris (DE)', kind: 'DE' }]
  },

  'Alpecin': {
    brand: 'Alpecin',
    country: 'Germany',
    aliases: ['alpecin', 'ალპეცინი'],
    primary: [
      { site: 'dm.de', label: 'dm (DE)', kind: 'DE' },
      { site: 'rossmann.de', label: 'Rossmann (DE)', kind: 'DE' }
    ],
    backup: [{ site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' }]
  },

  'Braun': {
    brand: 'Braun',
    country: 'Germany',
    aliases: ['braun', 'braun thermometer', 'braun health'],
    primary: [{ site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' }],
    backup: [{ site: 'rossmann.de', label: 'Rossmann (DE)', kind: 'DE' }]
  },

  'Oral-B': {
    brand: 'Oral-B',
    country: 'Germany',
    aliases: ['oral b', 'oral-b'],
    primary: [
      { site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' },
      { site: 'dm.de', label: 'dm (DE)', kind: 'DE' }
    ],
    backup: [{ site: 'docmorris.de', label: 'DocMorris (DE)', kind: 'DE' }]
  },

  'Elmex': {
    brand: 'Elmex',
    country: 'Germany',
    aliases: ['elmex'],
    primary: [{ site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' }],
    backup: [{ site: 'dm.de', label: 'dm (DE)', kind: 'DE' }]
  },

  'Lacalut': {
    brand: 'Lacalut',
    country: 'Germany',
    aliases: ['lacalut', 'ლაკალუტი'],
    primary: [{ site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' }],
    backup: [{ site: 'dm.de', label: 'dm (DE)', kind: 'DE' }]
  },

  'Lactacyd (DE alt)': {
    brand: 'Lactacyd',
    country: 'EU retail (often DE)',
    aliases: ['lactacyd alt'],
    primary: [{ site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' }]
  },

  // =========================
  // 🇮🇹 ITALY — parapharmacy (ძალიან კარგი ფასები)
  // =========================
  Rilastil: {
    brand: 'Rilastil',
    country: 'Italy',
    aliases: ['rilastil'],
    primary: [
      { site: 'farmae.it', label: 'Farmaè (IT)', kind: 'IT' },
      { site: 'amicafarmacia.com', label: 'AmicaFarmacia (IT)', kind: 'IT' }
    ],
    backup: [{ site: '1000farmacie.it', label: '1000Farmacie (IT)', kind: 'IT' }]
  },

  Lactacyd: {
    brand: 'Lactacyd',
    country: 'Italy',
    aliases: ['lactacyd'],
    primary: [
      { site: 'farmae.it', label: 'Farmaè (IT)', kind: 'IT' },
      { site: 'amicafarmacia.com', label: 'AmicaFarmacia (IT)', kind: 'IT' }
    ],
    backup: [{ site: '1000farmacie.it', label: '1000Farmacie (IT)', kind: 'IT' }]
  },

  BioNike: {
    brand: 'BioNike',
    country: 'Italy',
    aliases: ['bionike', 'bio nike'],
    primary: [
      { site: 'farmae.it', label: 'Farmaè (IT)', kind: 'IT' },
      { site: 'amicafarmacia.com', label: 'AmicaFarmacia (IT)', kind: 'IT' }
    ],
    backup: [{ site: '1000farmacie.it', label: '1000Farmacie (IT)', kind: 'IT' }]
  },

  Collistar: {
    brand: 'Collistar',
    country: 'Italy',
    aliases: ['collistar'],
    primary: [
      { site: 'farmae.it', label: 'Farmaè (IT)', kind: 'IT' },
      { site: 'amicafarmacia.com', label: 'AmicaFarmacia (IT)', kind: 'IT' }
    ],
    backup: [{ site: '1000farmacie.it', label: '1000Farmacie (IT)', kind: 'IT' }]
  },

  'Chicco': {
    brand: 'Chicco',
    country: 'Italy',
    aliases: ['chicco', 'ჩიკო'],
    primary: [
      { site: 'farmae.it', label: 'Farmaè (IT)', kind: 'IT' },
      { site: 'amicafarmacia.com', label: 'AmicaFarmacia (IT)', kind: 'IT' }
    ],
    backup: [{ site: '1000farmacie.it', label: '1000Farmacie (IT)', kind: 'IT' }]
  },

  'Proraso': {
    brand: 'Proraso',
    country: 'Italy',
    aliases: ['proraso', 'პრორასო'],
    primary: [{ site: 'farmae.it', label: 'Farmaè (IT)', kind: 'IT' }],
    backup: [{ site: 'amicafarmacia.com', label: 'AmicaFarmacia (IT)', kind: 'IT' }]
  },

  'Davines': {
    brand: 'Davines',
    country: 'Italy',
    aliases: ['davines'],
    primary: [{ site: 'farmae.it', label: 'Farmaè (IT)', kind: 'IT' }],
    backup: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }]
  },

  'Alfaparf': {
    brand: 'Alfaparf',
    country: 'Italy',
    aliases: ['alfaparf'],
    primary: [{ site: 'farmae.it', label: 'Farmaè (IT)', kind: 'IT' }],
    backup: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }]
  },

  'Elgon': {
    brand: 'Elgon',
    country: 'Italy',
    aliases: ['elgon', 'ელგონი'],
    primary: [{ site: 'farmae.it', label: 'Farmaè (IT)', kind: 'IT' }],
    backup: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }]
  },

  'Vitalcare': {
    brand: 'Vitalcare',
    country: 'Italy',
    aliases: ['vitalcare', 'ვიტალქეა'],
    primary: [{ site: 'farmae.it', label: 'Farmaè (IT)', kind: 'IT' }],
    backup: [{ site: '1000farmacie.it', label: '1000Farmacie (IT)', kind: 'IT' }]
  },

  'IL SALONE': {
    brand: 'IL SALONE',
    country: 'Italy',
    aliases: ['il salone', 'ilsalone', 'ილ სალონე'],
    primary: [{ site: 'farmae.it', label: 'Farmaè (IT)', kind: 'IT' }],
    backup: [{ site: 'amicafarmacia.com', label: 'AmicaFarmacia (IT)', kind: 'IT' }]
  },

  'Umberto Giannini': {
    brand: 'Umberto Giannini',
    country: 'Italy',
    aliases: ['umberto giannini', 'giannini', 'უმბერტო ჯანინი'],
    primary: [
      { site: 'farmae.it', label: 'Farmaè (IT)', kind: 'IT' },
      { site: 'amicafarmacia.com', label: 'AmicaFarmacia (IT)', kind: 'IT' }
    ],
    backup: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }]
  },

  // =========================
  // 🇪🇸 SPAIN — parapharmacy (ISDIN, SPF, etc.)
  // =========================
  ISDIN: {
    brand: 'ISDIN',
    country: 'Spain',
    aliases: ['isdin'],
    primary: [
      { site: 'atida.com', label: 'Atida (EU)', kind: 'EU' },
      { site: 'mifarma.eu', label: 'Mifarma (EU)', kind: 'EU' }
    ],
    backup: [{ site: 'promofarma.com', label: 'PromoFarma (ES/EU)', kind: 'ES' }]
  },

  'BABE': {
    brand: 'BABÉ',
    country: 'Spain',
    aliases: ['babe', 'babé', 'ბაბე'],
    primary: [
      { site: 'mifarma.eu', label: 'Mifarma (EU)', kind: 'EU' },
      { site: 'atida.com', label: 'Atida (EU)', kind: 'EU' }
    ],
    backup: [{ site: 'promofarma.com', label: 'PromoFarma (ES/EU)', kind: 'ES' }]
  },

  // =========================
  // 🇵🇱 / 🇪🇺 MULTI — Notino (cosmetics/hair often cheapest)
  // =========================
  Notino: {
    brand: 'Notino',
    country: 'EU',
    aliases: ['notino'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }]
  },

  'The Ordinary': {
    brand: 'The Ordinary',
    country: 'EU retail (often via Notino)',
    aliases: ['the ordinary', 'ordinary', 'ორდინარი', 'theord'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }],
    backup: [{ site: 'douglas.de', label: 'Douglas (DE/EU)', kind: 'EU' }]
  },

  'MISSHA': {
    brand: 'MISSHA',
    country: 'Korea (EU retail)',
    aliases: ['missha', 'მისშა'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }],
    backup: [{ site: 'douglas.de', label: 'Douglas (DE/EU)', kind: 'EU' }]
  },

  'Mizon': {
    brand: 'Mizon',
    country: 'Korea (EU retail)',
    aliases: ['mizon', 'მიზონი'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }]
  },

  'Ziaja': {
    brand: 'Ziaja',
    country: 'Poland',
    aliases: ['ziaja', 'ზიაია'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }]
  },

  // =========================
  // 🇨🇭 SWITZERLAND — oral care / accessories
  // =========================
  Curaprox: {
    brand: 'Curaprox',
    country: 'Switzerland',
    aliases: ['curaprox', 'კურაპროქსი'],
    primary: [
      { site: 'amicafarmacia.com', label: 'AmicaFarmacia (IT)', kind: 'IT' },
      { site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' }
    ],
    backup: [{ site: 'docmorris.de', label: 'DocMorris (DE)', kind: 'DE' }]
  },

  // =========================
  // 👶 BABY CARE — high demand, safe shipping
  // =========================
  'HiPP': {
    brand: 'HiPP',
    country: 'Germany',
    aliases: ['hipp'],
    primary: [
      { site: 'dm.de', label: 'dm (DE)', kind: 'DE' },
      { site: 'rossmann.de', label: 'Rossmann (DE)', kind: 'DE' }
    ]
  },

  'Babylove': {
    brand: 'Babylove',
    country: 'Germany',
    aliases: ['babylove'],
    primary: [{ site: 'dm.de', label: 'dm (DE)', kind: 'DE' }]
  },

  'Naïf': {
    brand: 'Naïf',
    country: 'Netherlands (EU retail)',
    aliases: ['naif', 'naïf', 'ნაიფი'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }],
    backup: [{ site: 'atida.com', label: 'Atida (EU)', kind: 'EU' }]
  },

  'Maternea': {
    brand: 'Maternea',
    country: 'EU retail',
    aliases: ['maternea', 'მატერნეა'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }]
  },

  // =========================
  // 🦷 ORAL CARE — small, easy shipping
  // =========================
  'Elgydium': {
    brand: 'Elgydium',
    country: 'France (EU retail)',
    aliases: ['elgydium', 'ელგიდიუმი'],
    primary: [{ site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' }],
    backup: [{ site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }]
  },

  'Ecodenta': {
    brand: 'Ecodenta',
    country: 'EU retail',
    aliases: ['ecodenta', 'ეკოდენტა'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }]
  },

  // =========================
  // 🚿 HYGIENE / DAILY — stable demand
  // =========================
  'Rituals': {
    brand: 'Rituals',
    country: 'Netherlands (EU retail)',
    aliases: ['rituals', 'რიტუალს'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }]
  },

  'Byphasse': {
    brand: 'Byphasse',
    country: 'Spain (EU retail)',
    aliases: ['byphasse', 'ბიფაზი'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }],
    backup: [{ site: 'mifarma.eu', label: 'Mifarma (EU)', kind: 'EU' }]
  },

  // =========================
  // 💇 HAIR CARE — very popular in Georgia, good EU price gaps
  // =========================
  'Olaplex': {
    brand: 'Olaplex',
    country: 'EU retail',
    aliases: ['olaplex', 'ოლაპლექსი'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }],
    backup: [{ site: 'douglas.de', label: 'Douglas (DE/EU)', kind: 'EU' }]
  },

  'Kérastase': {
    brand: 'Kérastase',
    country: 'France (EU retail)',
    aliases: ['kerastase', 'kérastase', 'კერასტასი', 'კერატას'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }],
    backup: [{ site: 'douglas.de', label: 'Douglas (DE/EU)', kind: 'EU' }]
  },

  'Redken': {
    brand: 'Redken',
    country: 'EU retail',
    aliases: ['redken', 'რედკენი'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }],
    backup: [{ site: 'douglas.de', label: 'Douglas (DE/EU)', kind: 'EU' }]
  },

  'Moroccanoil': {
    brand: 'Moroccanoil',
    country: 'EU retail',
    aliases: ['moroccanoil', 'moroccan oil', 'მოროკონოილი'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }]
  },

  'Mielle': {
    brand: 'Mielle',
    country: 'EU retail',
    aliases: ['mielle', 'მიელე'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }]
  },

  'K18': {
    brand: 'K18',
    country: 'EU retail',
    aliases: ['k18'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }],
    backup: [{ site: 'douglas.de', label: 'Douglas (DE/EU)', kind: 'EU' }]
  },

  'Marlies Möller': {
    brand: 'Marlies Möller',
    country: 'EU retail (often DE)',
    aliases: ['marlies moller', 'möller', 'marlies'],
    primary: [{ site: 'douglas.de', label: 'Douglas (DE/EU)', kind: 'EU' }],
    backup: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }]
  },

  // =========================
  // 🧴 FACE/BODY EXTRAS — common in Georgia
  // =========================
  'PanOxyl': {
    brand: 'PanOxyl',
    country: 'EU retail',
    aliases: ['panoxyl', 'პანოქსილი'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }]
  },

  'Aveeno': {
    brand: 'Aveeno',
    country: 'EU retail',
    aliases: ['aveeno', 'ავინო'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }],
    backup: [{ site: 'rossmann.de', label: 'Rossmann (DE)', kind: 'DE' }]
  },

  'Vaseline (EU alt)': {
    brand: 'Vaseline',
    country: 'EU retail',
    aliases: ['vaseline alt'],
    primary: [{ site: 'notino.com', label: 'Notino (EU)', kind: 'EU' }]
  },

  // =========================
  // ✅ Generic “brand families” — helpful when users paste category-ish links
  // (keeps model resilient; not harmful)
  // =========================
  'Generic Pharmacy (FR)': {
    brand: 'FR Pharmacy',
    country: 'France',
    aliases: ['parapharmacie', 'parapharmacy', 'pharmacie', 'pharmacy'],
    primary: [
      { site: 'easypara.fr', label: 'Easypara (FR)', kind: 'FR' },
      { site: 'cocooncenter.com', label: 'Cocooncenter (FR)', kind: 'FR' }
    ],
    backup: [{ site: 'santediscount.com', label: 'Santédiscount (FR)', kind: 'FR' }]
  },

  'Generic Pharmacy (IT)': {
    brand: 'IT Pharmacy',
    country: 'Italy',
    aliases: ['farmacia', 'parafarmacia', 'parafarmacia', 'farmacie'],
    primary: [
      { site: 'farmae.it', label: 'Farmaè (IT)', kind: 'IT' },
      { site: 'amicafarmacia.com', label: 'AmicaFarmacia (IT)', kind: 'IT' }
    ],
    backup: [{ site: '1000farmacie.it', label: '1000Farmacie (IT)', kind: 'IT' }]
  },

  'Generic Pharmacy (DE)': {
    brand: 'DE Pharmacy',
    country: 'Germany',
    aliases: ['apotheke', 'apotheke de', 'pharmacy de'],
    primary: [{ site: 'shop-apotheke.com', label: 'Shop-Apotheke (DE)', kind: 'DE' }],
    backup: [{ site: 'docmorris.de', label: 'DocMorris (DE)', kind: 'DE' }]
  }
};
