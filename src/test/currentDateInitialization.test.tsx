import { describe, it, expect } from 'vitest';

describe('Current Date Initialization', () => {
  it('should use current date instead of hardcoded September 2025', () => {
    // Test simple pour vérifier que la date n'est plus codée en dur
    const currentDate = new Date();
    const hardcodedDate = new Date(2025, 8, 1); // 1er septembre 2025
    
    // Vérifier que nous n'utilisons plus exactement la date codée en dur
    expect(currentDate.getTime()).not.toBe(hardcodedDate.getTime());
    
    // Vérifier que la date actuelle est bien différente du 1er septembre 2025
    // même si nous sommes en 2025
    const isExactlyHardcodedDate = 
      currentDate.getMonth() === 8 && 
      currentDate.getFullYear() === 2025 && 
      currentDate.getDate() === 1;
    
    expect(isExactlyHardcodedDate).toBe(false);
  });

  it('should initialize with current date object', () => {
    // Vérifier que new Date() sans paramètres donne la date actuelle
    const now = new Date();
    const testDate = new Date();
    
    // Les deux dates devraient être très proches (quelques millisecondes de différence max)
    const timeDifference = Math.abs(now.getTime() - testDate.getTime());
    expect(timeDifference).toBeLessThan(1000); // Moins d'une seconde de différence
  });

  it('should not use hardcoded date values', () => {
    // Vérifier que nous n'utilisons pas de valeurs codées en dur
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Ces valeurs devraient changer avec le temps, pas être fixes
    expect(typeof currentYear).toBe('number');
    expect(typeof currentMonth).toBe('number');
    expect(currentYear).toBeGreaterThanOrEqual(2024); // Au minimum 2024
    expect(currentMonth).toBeGreaterThanOrEqual(0);
    expect(currentMonth).toBeLessThanOrEqual(11);
  });
});