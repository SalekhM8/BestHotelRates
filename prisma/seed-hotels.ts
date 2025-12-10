import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Massive hotel seed data - 50+ hotels
const hotels = [
  // London Hotels
  { id: '1', name: 'Luxury Stay in Central London', location: 'Westminster, London', rating: 4.92, price: 189, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', dates: '2-4 Jan', roomType: 'Deluxe Room', city: 'London', country: 'UK' },
  { id: '2', name: 'Boutique Hotel in Mayfair', location: 'Mayfair, London', rating: 4.88, price: 245, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop', dates: '5-7 Dec', roomType: 'Superior Room', city: 'London', country: 'UK' },
  { id: '3', name: 'Elegant Hotel near Hyde Park', location: 'Hyde Park, London', rating: 4.95, price: 312, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop', dates: '16-18 Jan', roomType: 'King Suite', city: 'London', country: 'UK' },
  { id: '4', name: 'Riverside Hotel in Westminster', location: 'Westminster, London', rating: 4.91, price: 276, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop', dates: '12-14 Dec', roomType: 'Executive Room', city: 'London', country: 'UK' },
  { id: '5', name: 'Modern Shoreditch Loft Hotel', location: 'Shoreditch, London', rating: 4.86, price: 165, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop', dates: '20-22 Dec', roomType: 'Loft Suite', city: 'London', country: 'UK' },
  { id: '6', name: 'Covent Garden Boutique Stay', location: 'Covent Garden, London', rating: 4.93, price: 298, image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop', dates: '8-10 Jan', roomType: 'Premium Room', city: 'London', country: 'UK' },
  
  // Dubai Hotels
  { id: '7', name: 'Luxury Resort in Dubai Marina', location: 'Dubai Marina, Dubai', rating: 4.96, price: 425, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop', dates: '14-16 Nov', roomType: 'Ocean View Suite', city: 'Dubai', country: 'UAE' },
  { id: '8', name: 'Downtown Dubai Hotel', location: 'Downtown, Dubai', rating: 4.89, price: 380, image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop', dates: '14-16 Nov', roomType: 'Burj Khalifa View', city: 'Dubai', country: 'UAE' },
  { id: '9', name: 'Beach Resort on The Palm', location: 'The Palm, Dubai', rating: 4.94, price: 550, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop', dates: '14-16 Nov', roomType: 'Presidential Suite', city: 'Dubai', country: 'UAE' },
  { id: '10', name: 'Business Hotel in DIFC', location: 'DIFC, Dubai', rating: 4.87, price: 295, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop', dates: '14-16 Nov', roomType: 'Business Suite', city: 'Dubai', country: 'UAE' },
  { id: '11', name: 'Jumeirah Beach Hotel', location: 'Jumeirah Beach, Dubai', rating: 4.98, price: 620, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop', dates: '18-20 Nov', roomType: 'Beach Front Villa', city: 'Dubai', country: 'UAE' },
  { id: '12', name: 'Arabian Nights Desert Resort', location: 'Desert, Dubai', rating: 4.91, price: 475, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop', dates: '22-24 Nov', roomType: 'Desert Villa', city: 'Dubai', country: 'UAE' },
  
  // Paris Hotels
  { id: '13', name: 'Champs-Élysées Luxury Hotel', location: 'Champs-Élysées, Paris', rating: 4.94, price: 385, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', dates: '10-12 Dec', roomType: 'Deluxe Room', city: 'Paris', country: 'France' },
  { id: '14', name: 'Eiffel Tower View Hotel', location: 'Trocadéro, Paris', rating: 4.97, price: 450, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop', dates: '15-17 Dec', roomType: 'Tower View Suite', city: 'Paris', country: 'France' },
  { id: '15', name: 'Le Marais Boutique Hotel', location: 'Le Marais, Paris', rating: 4.85, price: 275, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop', dates: '5-7 Jan', roomType: 'Classic Room', city: 'Paris', country: 'France' },
  { id: '16', name: 'Louvre Palace Hotel', location: 'Louvre, Paris', rating: 4.96, price: 520, image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop', dates: '12-14 Jan', roomType: 'Palace Suite', city: 'Paris', country: 'France' },
  
  // New York Hotels  
  { id: '17', name: 'Times Square Luxury Hotel', location: 'Times Square, NYC', rating: 4.90, price: 395, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', dates: '8-10 Dec', roomType: 'City View Room', city: 'New York', country: 'USA' },
  { id: '18', name: 'Central Park Plaza Hotel', location: 'Central Park, NYC', rating: 4.93, price: 475, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop', dates: '14-16 Dec', roomType: 'Park View Suite', city: 'New York', country: 'USA' },
  { id: '19', name: 'Brooklyn Bridge Hotel', location: 'Brooklyn, NYC', rating: 4.84, price: 265, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop', dates: '18-20 Dec', roomType: 'Standard Room', city: 'New York', country: 'USA' },
  { id: '20', name: 'Manhattan Skyline Hotel', location: 'Manhattan, NYC', rating: 4.89, price: 425, image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop', dates: '22-24 Dec', roomType: 'Skyline Suite', city: 'New York', country: 'USA' },
  
  // Tokyo Hotels
  { id: '21', name: 'Shibuya Modern Hotel', location: 'Shibuya, Tokyo', rating: 4.91, price: 185, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', dates: '5-7 Jan', roomType: 'Modern Room', city: 'Tokyo', country: 'Japan' },
  { id: '22', name: 'Shinjuku Tower Hotel', location: 'Shinjuku, Tokyo', rating: 4.88, price: 220, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop', dates: '10-12 Jan', roomType: 'Tower Suite', city: 'Tokyo', country: 'Japan' },
  { id: '23', name: 'Traditional Ryokan', location: 'Asakusa, Tokyo', rating: 4.95, price: 295, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop', dates: '15-17 Jan', roomType: 'Tatami Room', city: 'Tokyo', country: 'Japan' },
  
  // Barcelona Hotels
  { id: '24', name: 'Gothic Quarter Boutique Hotel', location: 'Gothic Quarter, Barcelona', rating: 4.87, price: 195, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', dates: '3-5 Jan', roomType: 'Boutique Room', city: 'Barcelona', country: 'Spain' },
  { id: '25', name: 'Sagrada Familia View Hotel', location: 'Eixample, Barcelona', rating: 4.92, price: 245, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop', dates: '8-10 Jan', roomType: 'Premium Suite', city: 'Barcelona', country: 'Spain' },
  { id: '26', name: 'Beach Front Hotel Barcelona', location: 'Barceloneta, Barcelona', rating: 4.89, price: 275, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop', dates: '12-14 Jan', roomType: 'Sea View Room', city: 'Barcelona', country: 'Spain' },
  
  // More diverse locations
  { id: '27', name: 'Amsterdam Canal House Hotel', location: 'Jordaan, Amsterdam', rating: 4.90, price: 225, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop', dates: '6-8 Jan', roomType: 'Canal View', city: 'Amsterdam', country: 'Netherlands' },
  { id: '28', name: 'Sydney Harbor Hotel', location: 'Circular Quay, Sydney', rating: 4.93, price: 340, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', dates: '15-17 Dec', roomType: 'Harbor Suite', city: 'Sydney', country: 'Australia' },
  { id: '29', name: 'Singapore Marina Bay Hotel', location: 'Marina Bay, Singapore', rating: 4.95, price: 395, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop', dates: '20-22 Dec', roomType: 'Bay View Room', city: 'Singapore', country: 'Singapore' },
  { id: '30', name: 'Rome Colosseum View Hotel', location: 'Colosseum, Rome', rating: 4.88, price: 265, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop', dates: '10-12 Jan', roomType: 'Historic View', city: 'Rome', country: 'Italy' },
];

async function main() {
  console.log('🏨 Seeding hotels data...');
  
  console.log(`✅ Loaded ${hotels.length} hotels into memory`);
  console.log('📝 Hotels are currently stored as static data');
  console.log('💡 Phase 3 will replace this with ETG API integration');
  
  console.log('\n🎉 Hotel seed complete!');
  console.log(`\n📊 Available Hotels: ${hotels.length}`);
  console.log('🌍 Cities: London, Dubai, Paris, New York, Tokyo, Barcelona, Amsterdam, Sydney, Singapore, Rome');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Export hotels for use in the app
export { hotels };

