const cron = require('node-cron');
const PlacesSyncService = require('../scripts/placesSync');
const { Place } = require('../models/placeTypes');

class ScheduledSyncService {
  constructor(apiKey) {
    this.placesSyncService = new PlacesSyncService(apiKey);
    this.isRunning = false;
    this.lastSyncTime = null;
  }

  // Schedule full sync every week
  scheduleFullSync() {
    // Run at 2 AM every Monday
    return cron.schedule('0 2 * * 1', async () => {
      console.log('[Sync Service] Starting weekly full sync');
      await this.performFullSync();
    });
  }

  // Schedule daily updates for recently modified places
  scheduleDailyUpdates() {
    // Run at 3 AM every day
    return cron.schedule('0 3 * * *', async () => {
      console.log('[Sync Service] Starting daily updates sync');
      await this.performDailySync();
    });
  }

  // Schedule hourly updates for high-traffic regions
  scheduleHighTrafficSync() {
    // Run every hour for high-traffic regions (Dakar, Saint-Louis, Thiès)
    return cron.schedule('0 * * * *', async () => {
      console.log('[Sync Service] Starting high-traffic regions sync');
      await this.performHighTrafficSync();
    });
  }

  async performFullSync() {
    if (this.isRunning) {
      console.log('[Sync Service] Sync already in progress, skipping');
      return;
    }

    this.isRunning = true;
    const startTime = new Date();
    let totalProcessed = 0;
    let successCount = 0;
    let errorCount = 0;

    try {
      console.log('[Sync Service] Starting full sync of all regions');
      await this.placesSyncService.syncAllRegions();
      
      // Update last sync time for all places
      await Place.updateMany(
        { source: 'google_places' },
        { $set: { lastSyncTime: new Date() } }
      );

      const stats = await Place.aggregate([
        {
          $group: {
            _id: '$address.region',
            count: { $sum: 1 }
          }
        }
      ]);

      console.log('[Sync Service] Sync complete. Place counts by region:');
      stats.forEach(stat => {
        console.log(`- ${stat._id}: ${stat.count} places`);
      });

    } catch (error) {
      console.error('[Sync Service] Error in full sync:', error);
      errorCount++;
    } finally {
      this.isRunning = false;
      this.lastSyncTime = new Date();
      const duration = (new Date() - startTime) / 1000;
      console.log(`[Sync Service] Full sync completed in ${duration}s`);
    }
  }

  async performDailySync() {
    if (this.isRunning) {
      console.log('[Sync Service] Sync already in progress, skipping daily update');
      return;
    }

    this.isRunning = true;
    const startTime = new Date();
    let totalProcessed = 0;
    let successCount = 0;
    let errorCount = 0;

    try {
      console.log('[Sync Service] Starting daily sync');
      
      // Get places that haven't been synced in the last 24 hours
      const places = await Place.find({
        source: 'google_places',
        $or: [
          { lastSyncTime: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
          { lastSyncTime: null }
        ]
      });

      console.log(`[Sync Service] Found ${places.length} places to update`);

      for (const place of places) {
        try {
          const placeDetails = await this.placesSyncService.getPlaceDetails(place.googlePlaceId);
          if (placeDetails) {
            await this.placesSyncService.syncPlaceToDatabase(placeDetails);
            successCount++;
            console.log(`[Sync Service] Updated ${place.name}`);
          }
        } catch (error) {
          console.error(`[Sync Service] Error updating place ${place._id}:`, error);
          errorCount++;
        }
        totalProcessed++;
      }
    } finally {
      this.isRunning = false;
      this.lastSyncTime = new Date();
      const duration = (new Date() - startTime) / 1000;
      console.log(`[Sync Service] Daily sync completed in ${duration}s`);
      console.log(`[Sync Service] Processed: ${totalProcessed}, Success: ${successCount}, Errors: ${errorCount}`);
    }
  }

  async performHighTrafficSync() {
    if (this.isRunning) {
      console.log('[Sync Service] Sync already in progress, skipping high-traffic update');
      return;
    }

    this.isRunning = true;
    const startTime = new Date();
    const highTrafficRegions = ['Dakar', 'Saint-Louis', 'Thiès'];

    try {
      console.log('[Sync Service] Starting high-traffic regions sync');
      
      for (const region of highTrafficRegions) {
        console.log(`[Sync Service] Syncing ${region}`);
        await this.placesSyncService.syncRegion(region, 100); // Sync top 100 places
      }
    } catch (error) {
      console.error('[Sync Service] Error in high-traffic sync:', error);
    } finally {
      this.isRunning = false;
      const duration = (new Date() - startTime) / 1000;
      console.log(`[Sync Service] High-traffic sync completed in ${duration}s`);
    }
  }
}

module.exports = ScheduledSyncService; 