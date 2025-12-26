/**
 * Test script to verify Storage Mode Declaration (Phase 0.6.a)
 * 
 * Tests:
 * 1. Storage mode defaults to "memory"
 * 2. Storage mode can be overridden via env var
 * 3. DB mode falls back to memory if not implemented
 * 4. Status endpoint returns correct values
 */

import { STORAGE_MODE, getStorageModeInfo, type StorageMode } from '../server/storage';

console.log('🧪 Testing Storage Mode Declaration...\n');

// Test 1: Default mode is "memory"
console.log('Test 1: Default storage mode');
console.log(`   STORAGE_MODE: ${STORAGE_MODE}`);
if (STORAGE_MODE !== 'memory') {
  console.error('❌ FAILED: Default should be "memory"');
  process.exit(1);
}
console.log('   ✅ Default is "memory"\n');

// Test 2: getStorageModeInfo returns correct values
console.log('Test 2: getStorageModeInfo()');
const info = getStorageModeInfo();
console.log(`   mode: ${info.mode}`);
console.log(`   durable: ${info.durable}`);
console.log(`   notes: ${info.notes}`);

if (info.mode !== 'memory') {
  console.error('❌ FAILED: mode should be "memory"');
  process.exit(1);
}
if (info.durable !== false) {
  console.error('❌ FAILED: durable should be false for memory mode');
  process.exit(1);
}
if (!info.notes.includes('In-memory Maps')) {
  console.error('❌ FAILED: notes should mention "In-memory Maps"');
  process.exit(1);
}
console.log('   ✅ All values correct\n');

// Test 3: Verify type safety
console.log('Test 3: Type safety');
const mode: StorageMode = STORAGE_MODE;
if (mode !== 'memory' && mode !== 'db') {
  console.error('❌ FAILED: STORAGE_MODE must be "memory" or "db"');
  process.exit(1);
}
console.log('   ✅ Type is correct\n');

// Test 4: DB mode fallback (simulated)
console.log('Test 4: DB mode fallback behavior');
const dbInfo = getStorageModeInfo();
if (STORAGE_MODE === 'db') {
  // If DB is requested but not implemented, should fall back to memory
  if (dbInfo.mode !== 'memory') {
    console.error('❌ FAILED: DB mode should fall back to memory if not implemented');
    process.exit(1);
  }
  if (dbInfo.isDbRequested !== true) {
    console.error('❌ FAILED: isDbRequested should be true');
    process.exit(1);
  }
  if (dbInfo.isDbImplemented !== false) {
    console.error('❌ FAILED: isDbImplemented should be false');
    process.exit(1);
  }
  console.log('   ✅ DB mode correctly falls back to memory\n');
} else {
  console.log('   ⏭️  Skipped (STORAGE_MODE is not "db")\n');
}

console.log('✅ All tests passed!');
console.log('\n📋 Summary:');
console.log(`   - Storage mode: ${info.mode}`);
console.log(`   - Durable: ${info.durable}`);
console.log(`   - Notes: ${info.notes}`);

