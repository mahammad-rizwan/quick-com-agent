// Presentation mode fallback for when MCP services are unavailable
// This ensures the demo works smoothly for your presentation

export class PresentationCartManager {
  constructor() {
    this.mockCart = {
      blinkit: [],
      instamart: []
    };
  }

  // Simulate adding items to cart with realistic delays
  async addToBlinkitCart(items, send) {
    for (const item of items) {
      send("progress", {
        platform: "blinkit",
        message: `🛒 Adding "${item.name}" to Blinkit cart...`,
        status: "loading"
      });
      
      // Simulate processing time
      await new Promise(r => setTimeout(r, 1500));
      
      this.mockCart.blinkit.push(item);
      
      send("progress", {
        platform: "blinkit",
        message: `✅ "${item.name}" added — ₹${item.price}`,
        status: "done"
      });
    }
  }

  async addToInstamartCart(items, send) {
    for (const item of items) {
      send("progress", {
        platform: "instamart",
        message: `🛒 Adding "${item.name}" to Instamart cart...`,
        status: "loading"
      });
      
      // Simulate processing time
      await new Promise(r => setTimeout(r, 2000));
      
      this.mockCart.instamart.push(item);
      
      send("progress", {
        platform: "instamart",
        message: `✅ "${item.name}" added — ₹${item.price}`,
        status: "done"
      });
    }
  }

  // Generate realistic cart summary for presentation
  generateCartSummary(blinkitEta = 10, instamartEta = 20, recommendation = null) {
    const blinkitTotal = this.mockCart.blinkit.reduce((sum, item) => sum + item.price, 0);
    const instamartTotal = this.mockCart.instamart.reduce((sum, item) => sum + item.price, 0);

    return {
      blinkitCart: this.mockCart.blinkit,
      instamartCart: this.mockCart.instamart,
      blinkitTotal,
      instamartTotal,
      blinkitEta,
      instamartEta,
      recommendation,
      checkoutLinks: {
        blinkit: "https://blinkit.com/cart",
        instamart: "https://www.swiggy.com/instamart"
      },
      presentationMode: true // Flag to indicate this is demo data
    };
  }

  // Reset cart for new demo session
  reset() {
    this.mockCart = {
      blinkit: [],
      instamart: []
    };
  }

  // Get current cart state
  getCart() {
    return { ...this.mockCart };
  }
}

// Singleton instance for the presentation
export const presentationCart = new PresentationCartManager();