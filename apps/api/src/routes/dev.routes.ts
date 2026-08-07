import { FastifyInstance } from 'fastify';
import { dbRepository } from '@koti-scout/database';
import { schedulerService } from '../services/scheduler.service';
import { searchService } from '../services/search.service';
import { searchCache } from '../providers/cache';
import { Property } from '@koti-scout/shared';

export async function devRoutes(server: FastifyInstance) {
  // Only available in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // GET /api/dev/status
  server.get('/status', async (_request, reply) => {
    const { total } = await dbRepository.getProperties({});
    const savedSearches = await dbRepository.getSavedSearches('user-demo-01');
    const notifs = await dbRepository.getNotifications('user-demo-01');
    const favs = await dbRepository.getFavorites('user-demo-01');

    return reply.send({
      provider: searchService.getProviderName(),
      databaseMode: 'In-Memory Development Repository (PostgreSQL / Supabase Ready Schema)',
      apiStatus: 'healthy',
      mockPropertiesCount: total,
      savedSearchesCount: savedSearches.length,
      notificationsCount: notifs.length,
      favoritesCount: favs.length,
      timezone: process.env.DEFAULT_TIMEZONE || 'Europe/Helsinki',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // POST /api/dev/simulate-price-drop
  server.post('/simulate-price-drop', async (_request, reply) => {
    // Pick first property in database e.g. prop-hel-kallio-01 and reduce price
    const prop = await dbRepository.getPropertyById('prop-hel-kallio-01');
    if (!prop) {
      return reply.status(404).send({ error: 'Property not found' });
    }

    const oldPrice = prop.price;
    const newPrice = oldPrice > 200000 ? oldPrice - 20000 : oldPrice - 10000;
    const newSqmPrice = Math.round(newPrice / prop.area);

    const updatedProp: Property = {
      ...prop,
      price: newPrice,
      pricePerSquareMeter: newSqmPrice,
      lastSeenAt: new Date().toISOString()
    };

    searchCache.clear();
    await dbRepository.upsertProperty(updatedProp);

    return reply.send({
      success: true,
      message: `Simulated price reduction on ${prop.address} from €${oldPrice.toLocaleString('fi-FI')} to €${newPrice.toLocaleString('fi-FI')}`,
      property: updatedProp
    });
  });

  // POST /api/dev/simulate-new-property
  server.post('/simulate-new-property', async (_request, reply) => {
    const randomId = `prop-sim-${Date.now()}`;
    const newProp: Property = {
      id: randomId,
      externalId: `etuovi-sim-${Date.now()}`,
      provider: 'MockPropertyProvider',
      sourceUrl: `https://demo.kotiscout.fi/properties/${randomId}`,
      title: 'UUSI LÖYTÖ: Huippukuntoinen kaksio Töölönlahden tuntumassa',
      description: 'Valoisa koti esteettömillä puistonäkymillä. Oma lasitettu parveke, uusi kylpyhuone ja maltillinen yhtiövastike.',
      address: 'Mannerheimintie 42 B',
      postalCode: '00260',
      city: 'Helsinki',
      district: 'Töölö',
      latitude: 60.179,
      longitude: 24.93,
      price: 249000,
      area: 52.0,
      pricePerSquareMeter: 4788,
      rooms: 2,
      bedrooms: 1,
      propertyType: 'Apartment',
      buildYear: 2012,
      maintenanceFee: 215,
      floor: 4,
      totalFloors: 6,
      hasBalcony: true,
      hasSauna: false,
      hasElevator: true,
      energyClass: 'B2018',
      thumbnailUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80'
      ],
      publishedAt: new Date().toISOString(),
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      active: true,
      score: 93
    };

    searchCache.clear();
    await dbRepository.upsertProperty(newProp);

    return reply.send({
      success: true,
      message: `Simulated new listing: ${newProp.address} (€${newProp.price.toLocaleString('fi-FI')})`,
      property: newProp
    });
  });

  // POST /api/dev/simulate-removed-property
  server.post('/simulate-removed-property', async (_request, reply) => {
    const prop = await dbRepository.getPropertyById('prop-hel-pasila-06');
    if (!prop) {
      return reply.status(404).send({ error: 'Property not found' });
    }

    const updated = { ...prop, active: false };
    await dbRepository.upsertProperty(updated);
    searchCache.clear();

    return reply.send({
      success: true,
      message: `Simulated inactive/removed property: ${prop.address}`,
      property: updated
    });
  });

  // POST /api/dev/reset-state
  server.post('/reset-state', async (_request, reply) => {
    if (dbRepository.resetDefaults) {
      await dbRepository.resetDefaults();
    }
    searchCache.clear();
    return reply.send({
      success: true,
      message: 'Development database and cache reset to defaults with 40+ Finnish properties'
    });
  });
}
