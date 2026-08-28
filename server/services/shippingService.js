/**
 * Shipping Service Abstraction Layer (FR-029)
 * Provides a pluggable interface for shipping providers.
 * Currently uses a MockShippingProvider (simulated Delhivery-style responses).
 * To switch to a live provider, implement the ShippingProvider interface and update getShippingProvider().
 */

class ShippingProvider {
  async checkServiceability(pincode) { throw new Error('Not implemented'); }
  async getRate(pincode, weightGrams, codRequired) { throw new Error('Not implemented'); }
  async createShipment(orderData) { throw new Error('Not implemented'); }
  async cancelShipment(shipmentId) { throw new Error('Not implemented'); }
  async trackShipment(trackingNumber) { throw new Error('Not implemented'); }
  async generateLabel(shipmentId) { throw new Error('Not implemented'); }
}

class MockShippingProvider extends ShippingProvider {
  constructor() {
    super();
    // Simulated non-serviceable zones
    this._blockedPrefixes = ['90', '91', '92', '93'];
    // Simulated COD-available zones
    this._codPrefixes = ['1', '2', '3', '4', '5', '6'];
  }

  async checkServiceability(pincode) {
    const isValid = /^[1-9][0-9]{5}$/.test(pincode);
    if (!isValid) {
      return { serviceable: false, pincode, error: 'Invalid pincode format' };
    }

    const isBlocked = this._blockedPrefixes.some(p => pincode.startsWith(p));
    const codAvailable = this._codPrefixes.some(p => pincode.startsWith(p));

    // Simulate estimated delivery based on zone
    let estimatedDays = 5;
    if (pincode.startsWith('1') || pincode.startsWith('2')) estimatedDays = 3;
    else if (pincode.startsWith('3') || pincode.startsWith('4')) estimatedDays = 4;
    else if (pincode.startsWith('7') || pincode.startsWith('8')) estimatedDays = 6;

    return {
      serviceable: !isBlocked,
      pincode,
      estimated_days: isBlocked ? null : estimatedDays,
      cod_available: !isBlocked && codAvailable,
      provider: 'MockDelhivery',
    };
  }

  async getRate(pincode, weightGrams = 500, codRequired = false) {
    const serviceability = await this.checkServiceability(pincode);
    if (!serviceability.serviceable) {
      return { success: false, error: 'Pincode not serviceable' };
    }

    // Base rate: ₹40 for first 500g + ₹20 per additional 500g
    let shippingFee = 40;
    if (weightGrams > 500) {
      shippingFee += Math.ceil((weightGrams - 500) / 500) * 20;
    }

    // COD surcharge
    if (codRequired) {
      shippingFee += 30;
    }

    // Remote area surcharge for 7xx, 8xx pincodes
    if (pincode.startsWith('7') || pincode.startsWith('8')) {
      shippingFee += 25;
    }

    return {
      success: true,
      shipping_fee: shippingFee,
      estimated_days: serviceability.estimated_days,
      provider: 'MockDelhivery',
    };
  }

  async createShipment(orderData) {
    const trackingNumber = `DLVR${Date.now().toString(36).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      success: true,
      shipment_id: `SHP-${trackingNumber}`,
      tracking_number: trackingNumber,
      carrier: 'Delhivery',
      estimated_delivery: new Date(Date.now() + (orderData.estimated_days || 5) * 86400000).toISOString(),
      label_url: null,
      provider: 'MockDelhivery',
    };
  }

  async cancelShipment(shipmentId) {
    return {
      success: true,
      shipment_id: shipmentId,
      status: 'CANCELLED',
      provider: 'MockDelhivery',
    };
  }

  async trackShipment(trackingNumber) {
    return {
      success: true,
      tracking_number: trackingNumber,
      carrier: 'Delhivery',
      current_status: 'IN_TRANSIT',
      events: [
        { status: 'PICKED_UP', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), location: 'Haridwar Hub' },
        { status: 'IN_TRANSIT', timestamp: new Date(Date.now() - 86400000).toISOString(), location: 'Delhi Gateway' },
      ],
      provider: 'MockDelhivery',
    };
  }

  async generateLabel(shipmentId) {
    return {
      success: true,
      shipment_id: shipmentId,
      label_url: null,
      message: 'Label generation simulated (MockDelhivery)',
      provider: 'MockDelhivery',
    };
  }
}

import SelloshipShippingProvider from './selloshipService.js';

// Factory: returns the active shipping provider
let _provider = null;

export const getShippingProvider = () => {
  if (!_provider) {
    _provider = new SelloshipShippingProvider();
  }
  return _provider;
};

export { ShippingProvider, MockShippingProvider, SelloshipShippingProvider };

