/**
 * HotelBeds-compatible test data for when API quota is exhausted
 * Structure EXACTLY matches HotelBeds API response format
 */

// Helper to generate a HotelBeds-style rate key
const generateRateKey = (hotelCode: number, roomCode: string, boardCode: string) =>
  `20251224|20251226|W|${hotelCode}|${roomCode}|${boardCode}|B2B|RO||1~2~0||N@${Math.random().toString(36).slice(2, 10)}`;

// Real hotel images from Unsplash (royalty-free)
const HOTEL_IMAGES: Record<string, string[]> = {
  london: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
  ],
  paris: [
    'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
  ],
  dubai: [
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800',
    'https://images.unsplash.com/photo-1562790351-d273a961e0e9?w=800',
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800',
  ],
  newyork: [
    'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
    'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
    'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800',
  ],
  barcelona: [
    'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
    'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
  ],
};

interface MockHotelConfig {
  code: number;
  name: string;
  category: string;
  categoryCode: string;
  zone: string;
  minRate: number;
  currency: string;
  rooms: {
    code: string;
    name: string;
    rates: {
      boardCode: string;
      boardName: string;
      net: number;
      rateClass: string;
      allotment: number;
      cancellationPolicies?: { from: string }[];
    }[];
  }[];
}

function createMockHotel(
  code: number,
  name: string,
  stars: number,
  zone: string,
  destinationCode: string,
  destinationName: string,
  basePrice: number,
  imageIndex: number
): any {
  const categoryMap: Record<number, string> = {
    5: '5 ESTRELLAS',
    4: '4 ESTRELLAS', 
    3: '3 ESTRELLAS',
    2: '2 ESTRELLAS',
  };
  
  const cityKey = destinationName.toLowerCase().replace(/\s/g, '');
  const images = HOTEL_IMAGES[cityKey] || HOTEL_IMAGES.london;
  const imageUrl = images[imageIndex % images.length];
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);
  const cancelDate = tomorrow.toISOString().split('T')[0];
  
  return {
    code,
    name: { content: name },
    categoryCode: `${stars}EST`,
    categoryName: categoryMap[stars] || '3 ESTRELLAS',
    destinationCode,
    destinationName,
    zoneName: zone,
    countryCode: destinationCode === 'LON' ? 'GB' : destinationCode === 'PAR' ? 'FR' : destinationCode === 'DXB' ? 'AE' : destinationCode === 'NYC' ? 'US' : 'ES',
    latitude: 51.5074 + (Math.random() - 0.5) * 0.1,
    longitude: -0.1278 + (Math.random() - 0.5) * 0.1,
    minRate: basePrice,
    maxRate: basePrice * 1.5,
    currency: 'EUR',
    images: [
      { imageTypeCode: 'GEN', path: imageUrl, order: 1 }
    ],
    rooms: [
      {
        code: 'DBL.ST',
        name: 'Double Standard',
        rates: [
          {
            rateKey: generateRateKey(code, 'DBL.ST', 'RO'),
            rateClass: 'NOR',
            rateType: 'BOOKABLE',
            net: basePrice.toFixed(2),
            sellingRate: (basePrice * 1.1).toFixed(2),
            allotment: Math.floor(Math.random() * 8) + 2,
            boardCode: 'RO',
            boardName: 'ROOM ONLY',
            paymentType: 'AT_WEB',
            cancellationPolicies: [{ from: cancelDate, amount: (basePrice * 0.5).toFixed(2) }],
            rooms: 1,
            adults: 2,
            children: 0,
          },
          {
            rateKey: generateRateKey(code, 'DBL.ST', 'BB'),
            rateClass: 'NOR',
            rateType: 'BOOKABLE',
            net: (basePrice * 1.15).toFixed(2),
            sellingRate: (basePrice * 1.25).toFixed(2),
            allotment: Math.floor(Math.random() * 6) + 1,
            boardCode: 'BB',
            boardName: 'BED AND BREAKFAST',
            paymentType: 'AT_WEB',
            cancellationPolicies: [{ from: cancelDate, amount: (basePrice * 0.5).toFixed(2) }],
            rooms: 1,
            adults: 2,
            children: 0,
          },
        ],
      },
      {
        code: 'DBL.SU',
        name: 'Double Superior',
        rates: [
          {
            rateKey: generateRateKey(code, 'DBL.SU', 'RO'),
            rateClass: 'NRF',
            rateType: 'BOOKABLE',
            net: (basePrice * 1.3).toFixed(2),
            sellingRate: (basePrice * 1.4).toFixed(2),
            allotment: Math.floor(Math.random() * 4) + 1,
            boardCode: 'RO',
            boardName: 'ROOM ONLY',
            paymentType: 'AT_WEB',
            rooms: 1,
            adults: 2,
            children: 0,
          },
        ],
      },
    ],
  };
}

// London Hotels (20)
const LONDON_HOTELS = [
  createMockHotel(100001, 'The Langham London', 5, 'West End', 'LON', 'London', 450, 0),
  createMockHotel(100002, 'The Savoy', 5, 'Strand', 'LON', 'London', 520, 1),
  createMockHotel(100003, 'Claridges', 5, 'Mayfair', 'LON', 'London', 580, 2),
  createMockHotel(100004, 'The Dorchester', 5, 'Park Lane', 'LON', 'London', 620, 3),
  createMockHotel(100005, 'Park Plaza Westminster', 4, 'Westminster', 'LON', 'London', 180, 0),
  createMockHotel(100006, 'Hilton London Paddington', 4, 'Paddington', 'LON', 'London', 165, 1),
  createMockHotel(100007, 'Novotel London Tower Bridge', 4, 'Tower Hill', 'LON', 'London', 155, 2),
  createMockHotel(100008, 'Holiday Inn Camden Lock', 3, 'Camden', 'LON', 'London', 95, 3),
  createMockHotel(100009, 'Premier Inn London City', 3, 'City', 'LON', 'London', 89, 0),
  createMockHotel(100010, 'Travelodge London Central', 2, 'Kings Cross', 'LON', 'London', 65, 1),
  createMockHotel(100011, 'The Ritz London', 5, 'Piccadilly', 'LON', 'London', 750, 2),
  createMockHotel(100012, 'Corinthia London', 5, 'Embankment', 'LON', 'London', 480, 3),
  createMockHotel(100013, 'Shangri-La The Shard', 5, 'London Bridge', 'LON', 'London', 550, 0),
  createMockHotel(100014, 'DoubleTree by Hilton Tower', 4, 'Tower Hill', 'LON', 'London', 145, 1),
  createMockHotel(100015, 'Crowne Plaza London', 4, 'Shoreditch', 'LON', 'London', 135, 2),
  createMockHotel(100016, 'Ibis London Blackfriars', 3, 'Blackfriars', 'LON', 'London', 85, 3),
  createMockHotel(100017, 'Hub by Premier Inn Westminster', 3, 'Westminster', 'LON', 'London', 79, 0),
  createMockHotel(100018, 'Point A Hotel Shoreditch', 2, 'Shoreditch', 'LON', 'London', 55, 1),
  createMockHotel(100019, 'The Ned London', 5, 'City', 'LON', 'London', 420, 2),
  createMockHotel(100020, 'Mondrian London', 4, 'South Bank', 'LON', 'London', 195, 3),
];

// Paris Hotels (20)
const PARIS_HOTELS = [
  createMockHotel(200001, 'Le Bristol Paris', 5, 'Champs-Élysées', 'PAR', 'Paris', 680, 0),
  createMockHotel(200002, 'Four Seasons George V', 5, 'Champs-Élysées', 'PAR', 'Paris', 850, 1),
  createMockHotel(200003, 'The Peninsula Paris', 5, 'Arc de Triomphe', 'PAR', 'Paris', 720, 2),
  createMockHotel(200004, 'Hôtel Plaza Athénée', 5, 'Montaigne', 'PAR', 'Paris', 780, 3),
  createMockHotel(200005, 'Pullman Paris Tour Eiffel', 4, 'Tour Eiffel', 'PAR', 'Paris', 220, 0),
  createMockHotel(200006, 'Mercure Paris Centre', 4, 'Marais', 'PAR', 'Paris', 165, 1),
  createMockHotel(200007, 'Novotel Paris Les Halles', 4, 'Les Halles', 'PAR', 'Paris', 175, 2),
  createMockHotel(200008, 'Ibis Paris Opera', 3, 'Opera', 'PAR', 'Paris', 110, 3),
  createMockHotel(200009, 'Hotel Paris Bastille', 3, 'Bastille', 'PAR', 'Paris', 95, 0),
  createMockHotel(200010, 'Generator Paris', 2, 'Gare du Nord', 'PAR', 'Paris', 55, 1),
  createMockHotel(200011, 'Le Meurice', 5, 'Tuileries', 'PAR', 'Paris', 920, 2),
  createMockHotel(200012, 'Mandarin Oriental Paris', 5, 'Concorde', 'PAR', 'Paris', 750, 3),
  createMockHotel(200013, 'Hôtel de Crillon', 5, 'Place de la Concorde', 'PAR', 'Paris', 880, 0),
  createMockHotel(200014, 'Sofitel Paris Le Faubourg', 4, 'Madeleine', 'PAR', 'Paris', 280, 1),
  createMockHotel(200015, 'Renaissance Paris Vendome', 4, 'Vendome', 'PAR', 'Paris', 245, 2),
  createMockHotel(200016, 'Hotel Indigo Paris Opera', 4, 'Opera', 'PAR', 'Paris', 185, 3),
  createMockHotel(200017, 'Citadines Les Halles', 3, 'Les Halles', 'PAR', 'Paris', 125, 0),
  createMockHotel(200018, 'Hotel Eiffel Turenne', 3, 'Marais', 'PAR', 'Paris', 105, 1),
  createMockHotel(200019, 'Timhotel Opera Blanche', 2, 'Pigalle', 'PAR', 'Paris', 70, 2),
  createMockHotel(200020, 'Park Hyatt Paris Vendome', 5, 'Vendome', 'PAR', 'Paris', 820, 3),
];

// Dubai Hotels (20)
const DUBAI_HOTELS = [
  createMockHotel(300001, 'Burj Al Arab Jumeirah', 5, 'Jumeirah Beach', 'DXB', 'Dubai', 1800, 0),
  createMockHotel(300002, 'Atlantis The Palm', 5, 'Palm Jumeirah', 'DXB', 'Dubai', 450, 1),
  createMockHotel(300003, 'Armani Hotel Dubai', 5, 'Downtown', 'DXB', 'Dubai', 520, 2),
  createMockHotel(300004, 'One&Only Royal Mirage', 5, 'Dubai Marina', 'DXB', 'Dubai', 380, 3),
  createMockHotel(300005, 'JW Marriott Marquis', 5, 'Business Bay', 'DXB', 'Dubai', 195, 0),
  createMockHotel(300006, 'Hilton Dubai Creek', 4, 'Deira', 'DXB', 'Dubai', 125, 1),
  createMockHotel(300007, 'Rove Downtown', 3, 'Downtown', 'DXB', 'Dubai', 85, 2),
  createMockHotel(300008, 'Ibis Al Rigga', 2, 'Deira', 'DXB', 'Dubai', 55, 3),
  createMockHotel(300009, 'Address Downtown', 5, 'Downtown', 'DXB', 'Dubai', 340, 0),
  createMockHotel(300010, 'Jumeirah Beach Hotel', 5, 'Jumeirah Beach', 'DXB', 'Dubai', 420, 1),
  createMockHotel(300011, 'Raffles Dubai', 5, 'Wafi', 'DXB', 'Dubai', 280, 2),
  createMockHotel(300012, 'Waldorf Astoria Palm', 5, 'Palm Jumeirah', 'DXB', 'Dubai', 390, 3),
  createMockHotel(300013, 'Sofitel Dubai Downtown', 5, 'Downtown', 'DXB', 'Dubai', 220, 0),
  createMockHotel(300014, 'Marriott Harbour Hotel', 4, 'Dubai Marina', 'DXB', 'Dubai', 145, 1),
  createMockHotel(300015, 'DoubleTree JBR', 4, 'JBR', 'DXB', 'Dubai', 135, 2),
  createMockHotel(300016, 'Crowne Plaza Festival City', 4, 'Festival City', 'DXB', 'Dubai', 115, 3),
  createMockHotel(300017, 'Ramada Plaza JBR', 4, 'JBR', 'DXB', 'Dubai', 105, 0),
  createMockHotel(300018, 'Premier Inn Ibn Battuta', 3, 'Ibn Battuta', 'DXB', 'Dubai', 65, 1),
  createMockHotel(300019, 'Citymax Al Barsha', 3, 'Al Barsha', 'DXB', 'Dubai', 55, 2),
  createMockHotel(300020, 'Four Seasons DIFC', 5, 'DIFC', 'DXB', 'Dubai', 480, 3),
];

// New York Hotels (20)
const NEWYORK_HOTELS = [
  createMockHotel(400001, 'The Plaza Hotel', 5, 'Central Park', 'NYC', 'New York', 750, 0),
  createMockHotel(400002, 'The St. Regis New York', 5, 'Midtown', 'NYC', 'New York', 820, 1),
  createMockHotel(400003, 'Mandarin Oriental NYC', 5, 'Columbus Circle', 'NYC', 'New York', 680, 2),
  createMockHotel(400004, 'The Peninsula New York', 5, 'Fifth Avenue', 'NYC', 'New York', 720, 3),
  createMockHotel(400005, 'Park Hyatt New York', 5, 'Midtown', 'NYC', 'New York', 580, 0),
  createMockHotel(400006, 'Conrad New York Downtown', 4, 'Financial District', 'NYC', 'New York', 285, 1),
  createMockHotel(400007, 'Marriott Marquis Times Sq', 4, 'Times Square', 'NYC', 'New York', 265, 2),
  createMockHotel(400008, 'Hilton Midtown', 4, 'Midtown', 'NYC', 'New York', 225, 3),
  createMockHotel(400009, 'Holiday Inn Times Square', 3, 'Times Square', 'NYC', 'New York', 165, 0),
  createMockHotel(400010, 'Pod 51 Hotel', 3, 'Midtown East', 'NYC', 'New York', 125, 1),
  createMockHotel(400011, 'YOTEL New York', 3, 'Times Square', 'NYC', 'New York', 145, 2),
  createMockHotel(400012, 'citizenM New York', 3, 'Times Square', 'NYC', 'New York', 155, 3),
  createMockHotel(400013, 'The Baccarat Hotel', 5, 'Midtown', 'NYC', 'New York', 950, 0),
  createMockHotel(400014, 'Four Seasons Downtown', 5, 'Tribeca', 'NYC', 'New York', 720, 1),
  createMockHotel(400015, 'The Carlyle', 5, 'Upper East Side', 'NYC', 'New York', 680, 2),
  createMockHotel(400016, 'InterContinental Barclay', 4, 'Midtown', 'NYC', 'New York', 295, 3),
  createMockHotel(400017, 'The Westin Grand Central', 4, 'Midtown', 'NYC', 'New York', 245, 0),
  createMockHotel(400018, 'Sheraton Times Square', 4, 'Times Square', 'NYC', 'New York', 215, 1),
  createMockHotel(400019, 'La Quinta Inn Manhattan', 2, 'Midtown', 'NYC', 'New York', 95, 2),
  createMockHotel(400020, 'The Bowery Hotel', 4, 'East Village', 'NYC', 'New York', 320, 3),
];

// Barcelona Hotels (20)
const BARCELONA_HOTELS = [
  createMockHotel(500001, 'Hotel Arts Barcelona', 5, 'Port Olimpic', 'BCN', 'Barcelona', 380, 0),
  createMockHotel(500002, 'W Barcelona', 5, 'Barceloneta', 'BCN', 'Barcelona', 420, 1),
  createMockHotel(500003, 'Mandarin Oriental BCN', 5, 'Passeig de Gracia', 'BCN', 'Barcelona', 520, 2),
  createMockHotel(500004, 'The Barcelona Edition', 5, 'Gothic Quarter', 'BCN', 'Barcelona', 380, 3),
  createMockHotel(500005, 'Hilton Diagonal Mar', 4, 'Diagonal Mar', 'BCN', 'Barcelona', 165, 0),
  createMockHotel(500006, 'Novotel Barcelona City', 4, 'Eixample', 'BCN', 'Barcelona', 135, 1),
  createMockHotel(500007, 'Ibis Barcelona Centro', 3, 'Raval', 'BCN', 'Barcelona', 85, 2),
  createMockHotel(500008, 'Generator Barcelona', 2, 'Gracia', 'BCN', 'Barcelona', 45, 3),
  createMockHotel(500009, 'Hotel 1898 Barcelona', 4, 'La Rambla', 'BCN', 'Barcelona', 195, 0),
  createMockHotel(500010, 'Majestic Hotel & Spa', 5, 'Passeig de Gracia', 'BCN', 'Barcelona', 340, 1),
  createMockHotel(500011, 'Ohla Barcelona', 5, 'Gothic Quarter', 'BCN', 'Barcelona', 290, 2),
  createMockHotel(500012, 'Casa Fuster', 5, 'Gracia', 'BCN', 'Barcelona', 265, 3),
  createMockHotel(500013, 'Almanac Barcelona', 5, 'Gran Via', 'BCN', 'Barcelona', 310, 0),
  createMockHotel(500014, 'Pullman Barcelona Skipper', 4, 'Port Olimpic', 'BCN', 'Barcelona', 175, 1),
  createMockHotel(500015, 'NH Collection Constanza', 4, 'Diagonal', 'BCN', 'Barcelona', 145, 2),
  createMockHotel(500016, 'AC Hotel Barcelona Forum', 4, 'Forum', 'BCN', 'Barcelona', 125, 3),
  createMockHotel(500017, 'Catalonia Plaza Catalunya', 3, 'Plaza Catalunya', 'BCN', 'Barcelona', 95, 0),
  createMockHotel(500018, 'Hotel Jazz Barcelona', 3, 'Eixample', 'BCN', 'Barcelona', 105, 1),
  createMockHotel(500019, 'Hotel Denit Barcelona', 3, 'La Rambla', 'BCN', 'Barcelona', 85, 2),
  createMockHotel(500020, 'Yurbban Trafalgar', 3, 'Born', 'BCN', 'Barcelona', 115, 3),
];

// Map destination codes to hotels
const MOCK_HOTELS_BY_DESTINATION: Record<string, any[]> = {
  LON: LONDON_HOTELS,
  PAR: PARIS_HOTELS,
  DXB: DUBAI_HOTELS,
  NYC: NEWYORK_HOTELS,
  BCN: BARCELONA_HOTELS,
};

/**
 * Get mock hotels for a destination - EXACT HotelBeds structure
 */
export function getMockHotelsForDestination(destinationCode: string): any[] {
  const code = destinationCode.toUpperCase();
  return MOCK_HOTELS_BY_DESTINATION[code] || LONDON_HOTELS;
}

/**
 * Get a single mock hotel by ID - EXACT HotelBeds structure
 */
export function getMockHotelById(hotelId: string | number): any | null {
  const id = Number(hotelId);
  for (const hotels of Object.values(MOCK_HOTELS_BY_DESTINATION)) {
    const found = hotels.find(h => h.code === id);
    if (found) return found;
  }
  return null;
}

/**
 * Get all mock hotels
 */
export function getAllMockHotels(): any[] {
  return Object.values(MOCK_HOTELS_BY_DESTINATION).flat();
}


