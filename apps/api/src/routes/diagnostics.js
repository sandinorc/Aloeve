import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// List of collections to search
const COLLECTIONS_TO_SEARCH = [
  'usuarios',
  'logs_actividad',
  'clientes',
  'participantes',
  'sesiones',
  'facilitadores',
  'productos'
];

// Helper function to check if a string is a valid PocketBase ID format (15 chars alphanumeric)
const isValidIdFormat = (id) => {
  return /^[a-z0-9]{15}$/.test(id);
};

// Helper function to search for ID in a record (recursively checks all fields)
const findIdInRecord = (record, searchId) => {
  for (const key in record) {
    const value = record[key];
    
    // Check if value is the ID itself
    if (value === searchId) {
      return true;
    }
    
    // Check if value is a string containing the ID
    if (typeof value === 'string' && value.includes(searchId)) {
      return true;
    }
    
    // Check if value is an array
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === searchId || (typeof item === 'string' && item.includes(searchId))) {
          return true;
        }
      }
    }
  }
  return false;
};

router.get('/find-id/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!id || id.trim() === '') {
    return res.status(400).json({ error: 'ID parameter is required' });
  }
  
  const searchId = id.trim();
  const isValidFormat = isValidIdFormat(searchId);
  const foundIn = [];
  let totalOccurrences = 0;
  
  logger.info(`Searching for ID: ${searchId} across all collections`);
  
  // Search in each collection
  for (const collectionName of COLLECTIONS_TO_SEARCH) {
    const records = await pb.collection(collectionName).getFullList();
    const matchingRecords = [];
    
    for (const record of records) {
      if (findIdInRecord(record, searchId)) {
        matchingRecords.push(record);
        totalOccurrences++;
      }
    }
    
    if (matchingRecords.length > 0) {
      foundIn.push({
        collection: collectionName,
        count: matchingRecords.length,
        records: matchingRecords
      });
      logger.info(`Found ${matchingRecords.length} records in collection: ${collectionName}`);
    }
  }
  
  const response = {
    id: searchId,
    found_in: foundIn,
    total_occurrences: totalOccurrences,
    is_valid_id_format: isValidFormat
  };
  
  if (totalOccurrences === 0) {
    response.message = 'ID not found in any collection';
  }
  
  logger.info(`Search completed for ID: ${searchId}. Found in ${foundIn.length} collections with ${totalOccurrences} total occurrences`);
  
  res.json(response);
});

export default router;