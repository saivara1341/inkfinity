// Comprehensive Indian Printing Industry Product Data
// Researched from VistaPrint India, PrintStop, Adobe Express, and industry standards

export interface PrintSize {
  id: string;
  label: string;
  dimensions: string;
  widthMM: number;
  heightMM: number;
  widthInch: string;
  heightInch: string;
  basePrice: number;
}

export interface PaperType {
  id: string;
  label: string;
  gsm: number;
  description: string;
  priceMultiplier: number;
  image?: string;
}

export interface FinishType {
  id: string;
  label: string;
  description: string;
  priceAdd: number;
  image?: string;
}

export interface QuantityTier {
  min: number;
  max: number;
  pricePerUnit: number;
}

export interface PrintingMethod {
  id: string;
  label: string;
  description: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  subcategories: ProductSubcategory[];
}

export interface ProductSubcategory {
  id: string;
  name: string;
  description: string;
  image?: string;
  startingPrice: string;
  unit: string;
  minQty: number;
  sizes: PrintSize[];
  papers: PaperType[];
  finishes: FinishType[];
  quantityTiers: QuantityTier[];
  printingMethods: PrintingMethod[];
  turnaroundDays: string;
  popular?: boolean;
}

// ═══════════════════════════════════════════════
// VISITING CARDS / BUSINESS CARDS
// ═══════════════════════════════════════════════
const visitingCardSizes: PrintSize[] = [
  { id: "vc-standard", label: "Standard", dimensions: "89 × 51 mm", widthMM: 89, heightMM: 51, widthInch: "3.5", heightInch: "2", basePrice: 1.5 },
  { id: "vc-indian", label: "Indian Standard", dimensions: "89 × 54 mm", widthMM: 89, heightMM: 54, widthInch: "3.5", heightInch: "2.1", basePrice: 1.5 },
  { id: "vc-square", label: "Square", dimensions: "65 × 65 mm", widthMM: 65, heightMM: 65, widthInch: "2.5", heightInch: "2.5", basePrice: 1.8 },
  { id: "vc-mini", label: "Mini", dimensions: "76 × 38 mm", widthMM: 76, heightMM: 38, widthInch: "3", heightInch: "1.5", basePrice: 1.2 },
  { id: "vc-us", label: "US Standard", dimensions: "89 × 51 mm", widthMM: 89, heightMM: 51, widthInch: "3.5", heightInch: "2", basePrice: 1.5 },
  { id: "vc-eu", label: "European", dimensions: "85 × 55 mm", widthMM: 85, heightMM: 55, widthInch: "3.35", heightInch: "2.17", basePrice: 1.6 },
  { id: "vc-folded", label: "Folded", dimensions: "89 × 102 mm (folded to 89×51)", widthMM: 89, heightMM: 102, widthInch: "3.5", heightInch: "4", basePrice: 3 },
  { id: "vc-rounded", label: "Rounded Corners", dimensions: "89 × 51 mm", widthMM: 89, heightMM: 51, widthInch: "3.5", heightInch: "2", basePrice: 2 },
];

const visitingCardPapers: PaperType[] = [
  { id: "art-300", label: "300 GSM Art Card", gsm: 300, description: "Standard glossy finish, professional look", priceMultiplier: 1, image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop" },
  { id: "art-350", label: "350 GSM Art Card", gsm: 350, description: "Thicker, premium feel", priceMultiplier: 1.15, image: "https://images.unsplash.com/photo-1586075010620-687cd7a3297a?w=200&h=200&fit=crop" },
  { id: "matte-350", label: "350 GSM Matte Card", gsm: 350, description: "Elegant non-glossy finish", priceMultiplier: 1.2, image: "https://images.unsplash.com/photo-1572502742898-d5e4a3e5e1b5?w=200&h=200&fit=crop" },
  { id: "textured-400", label: "400 GSM Textured", gsm: 400, description: "Linen or felt texture, luxury feel", priceMultiplier: 1.8, image: "https://images.unsplash.com/photo-1589384267710-7a25bc5b4862?w=200&h=200&fit=crop" },
  { id: "metallic", label: "Metallic Gold/Silver", gsm: 350, description: "Shimmering metallic finish", priceMultiplier: 2.5, image: "https://images.unsplash.com/photo-1589384267710-7a25bc5b4862?w=200&h=200&fit=crop" },
  { id: "transparent-pvc", label: "Transparent PVC", gsm: 0, description: "Clear plastic card, modern look", priceMultiplier: 4, image: "https://images.unsplash.com/photo-1581413809628-98e3b3a5fe6f?w=200&h=200&fit=crop" },
  { id: "kraft", label: "300 GSM Kraft Paper", gsm: 300, description: "Eco-friendly rustic brown", priceMultiplier: 1.3, image: "https://images.unsplash.com/photo-1595113316349-9fa430eb3749?w=200&h=200&fit=crop" },
  { id: "velvet", label: "400 GSM Velvet Touch", gsm: 400, description: "Soft-touch laminated, ultra premium", priceMultiplier: 3, image: "https://images.unsplash.com/photo-1586075010620-687cd7a3297a?w=200&h=200&fit=crop" },
];

const visitingCardFinishes: FinishType[] = [
  { id: "none", label: "No Finish", description: "Standard uncoated", priceAdd: 0, image: "https://images.unsplash.com/photo-1586075010620-687cd7a3297a?w=200&h=200&fit=crop" },
  { id: "glossy-lam", label: "Glossy Lamination", description: "Shiny protective coating", priceAdd: 0.3, image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop" },
  { id: "matte-lam", label: "Matte Lamination", description: "Smooth matte protective coating", priceAdd: 0.4, image: "https://images.unsplash.com/photo-1572502742898-d5e4a3e5e1b5?w=200&h=200&fit=crop" },
  { id: "spot-uv", label: "Spot UV", description: "Raised glossy accent on specific areas", priceAdd: 0.8, image: "https://images.unsplash.com/photo-1589384267710-7a25bc5b4862?w=200&h=200&fit=crop" },
  { id: "foil-gold", label: "Gold Foil Stamping", description: "Metallic gold emboss on text/logo", priceAdd: 1.5, image: "https://images.unsplash.com/photo-1589384267710-7a25bc5b4862?w=200&h=200&fit=crop" },
  { id: "foil-silver", label: "Silver Foil Stamping", description: "Metallic silver emboss", priceAdd: 1.5, image: "https://images.unsplash.com/photo-1589384267710-7a25bc5b4862?w=200&h=200&fit=crop" },
  { id: "emboss", label: "Embossing", description: "Raised 3D texture on design elements", priceAdd: 1.2, image: "https://images.unsplash.com/photo-1586075010620-687cd7a3297a?w=200&h=200&fit=crop" },
  { id: "deboss", label: "Debossing", description: "Pressed-in texture", priceAdd: 1.2, image: "https://images.unsplash.com/photo-1586075010620-687cd7a3297a?w=200&h=200&fit=crop" },
  { id: "edge-color", label: "Edge Coloring", description: "Painted card edges for premium look", priceAdd: 2, image: "https://images.unsplash.com/photo-1589384267710-7a25bc5b4862?w=200&h=200&fit=crop" },
];

// ═══════════════════════════════════════════════
// FLYERS & LEAFLETS
// ═══════════════════════════════════════════════
const flyerSizes: PrintSize[] = [
  { id: "fly-a6", label: "A6", dimensions: "105 × 148 mm", widthMM: 105, heightMM: 148, widthInch: "4.1", heightInch: "5.8", basePrice: 2 },
  { id: "fly-a5", label: "A5", dimensions: "148 × 210 mm", widthMM: 148, heightMM: 210, widthInch: "5.8", heightInch: "8.3", basePrice: 3 },
  { id: "fly-a4", label: "A4", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 5 },
  { id: "fly-dl", label: "DL (1/3 A4)", dimensions: "99 × 210 mm", widthMM: 99, heightMM: 210, widthInch: "3.9", heightInch: "8.3", basePrice: 2.5 },
  { id: "fly-letter", label: "Letter", dimensions: "216 × 279 mm", widthMM: 216, heightMM: 279, widthInch: "8.5", heightInch: "11", basePrice: 5 },
  { id: "fly-custom-small", label: "Custom Small", dimensions: "127 × 178 mm", widthMM: 127, heightMM: 178, widthInch: "5", heightInch: "7", basePrice: 3 },
];

const flyerPapers: PaperType[] = [
  { id: "gloss-100", label: "100 GSM Gloss Art", gsm: 100, description: "Lightweight, economical", priceMultiplier: 0.8 },
  { id: "gloss-130", label: "130 GSM Gloss Art", gsm: 130, description: "Standard flyer paper", priceMultiplier: 1 },
  { id: "matte-130", label: "130 GSM Matte Art", gsm: 130, description: "Non-glossy standard", priceMultiplier: 1.05 },
  { id: "gloss-170", label: "170 GSM Gloss Art", gsm: 170, description: "Premium thick flyer", priceMultiplier: 1.3 },
  { id: "matte-170", label: "170 GSM Matte Art", gsm: 170, description: "Thick matte premium", priceMultiplier: 1.35 },
  { id: "art-200", label: "200 GSM Art Paper", gsm: 200, description: "Rigid, near-card stock", priceMultiplier: 1.6 },
  { id: "bond-80", label: "80 GSM Bond Paper", gsm: 80, description: "Newspaper-like, cheapest", priceMultiplier: 0.6 },
];

const flyerFinishes: FinishType[] = [
  { id: "none", label: "No Finish", description: "As-is from print", priceAdd: 0 },
  { id: "glossy-lam", label: "Glossy Lamination", description: "Full glossy coating", priceAdd: 1 },
  { id: "matte-lam", label: "Matte Lamination", description: "Matte protective layer", priceAdd: 1.2 },
  { id: "aqueous", label: "Aqueous Coating", description: "Water-based protective shine", priceAdd: 0.5 },
];

// ═══════════════════════════════════════════════
// PAMPHLETS & BROCHURES
// ═══════════════════════════════════════════════
const pamphletSizes: PrintSize[] = [
  { id: "pam-a4-bifold", label: "A4 Bi-Fold", dimensions: "210 × 297 mm → 210 × 148.5 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 8 },
  { id: "pam-a4-trifold", label: "A4 Tri-Fold", dimensions: "210 × 297 mm → 99 × 210 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 10 },
  { id: "pam-a5-bifold", label: "A5 Bi-Fold", dimensions: "148 × 210 mm → 105 × 148 mm", widthMM: 148, heightMM: 210, widthInch: "5.8", heightInch: "8.3", basePrice: 6 },
  { id: "pam-a3-bifold", label: "A3 Bi-Fold", dimensions: "297 × 420 mm → 210 × 297 mm", widthMM: 297, heightMM: 420, widthInch: "11.7", heightInch: "16.5", basePrice: 15 },
  { id: "pam-dl", label: "DL Tri-Fold", dimensions: "99 × 210 mm", widthMM: 99, heightMM: 210, widthInch: "3.9", heightInch: "8.3", basePrice: 7 },
  { id: "pam-z-fold", label: "A4 Z-Fold", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 10 },
  { id: "pam-gate-fold", label: "Gate Fold", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 12 },
];

// ═══════════════════════════════════════════════
// POSTERS
// ═══════════════════════════════════════════════
const posterSizes: PrintSize[] = [
  { id: "pos-a4", label: "A4", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 25 },
  { id: "pos-a3", label: "A3", dimensions: "297 × 420 mm", widthMM: 297, heightMM: 420, widthInch: "11.7", heightInch: "16.5", basePrice: 49 },
  { id: "pos-a2", label: "A2", dimensions: "420 × 594 mm", widthMM: 420, heightMM: 594, widthInch: "16.5", heightInch: "23.4", basePrice: 89 },
  { id: "pos-a1", label: "A1", dimensions: "594 × 841 mm", widthMM: 594, heightMM: 841, widthInch: "23.4", heightInch: "33.1", basePrice: 149 },
  { id: "pos-a0", label: "A0", dimensions: "841 × 1189 mm", widthMM: 841, heightMM: 1189, widthInch: "33.1", heightInch: "46.8", basePrice: 299 },
  { id: "pos-12x18", label: "12 × 18 inch (Indian Standard)", dimensions: "305 × 457 mm", widthMM: 305, heightMM: 457, widthInch: "12", heightInch: "18", basePrice: 35 },
  { id: "pos-13x19", label: "13 × 19 inch (Super A3)", dimensions: "330 × 483 mm", widthMM: 330, heightMM: 483, widthInch: "13", heightInch: "19", basePrice: 40 },
  { id: "pos-18x24", label: "18 × 24 inch", dimensions: "457 × 610 mm", widthMM: 457, heightMM: 610, widthInch: "18", heightInch: "24", basePrice: 99 },
  { id: "pos-24x36", label: "24 × 36 inch", dimensions: "610 × 914 mm", widthMM: 610, heightMM: 914, widthInch: "24", heightInch: "36", basePrice: 179 },
  { id: "pos-36x48", label: "36 × 48 inch", dimensions: "914 × 1219 mm", widthMM: 914, heightMM: 1219, widthInch: "36", heightInch: "48", basePrice: 299 },
];

const posterPapers: PaperType[] = [
  { id: "gloss-170", label: "170 GSM Gloss Art", gsm: 170, description: "Standard poster paper", priceMultiplier: 1 },
  { id: "gloss-200", label: "200 GSM Gloss Art", gsm: 200, description: "Thick, vibrant colors", priceMultiplier: 1.3 },
  { id: "matte-200", label: "200 GSM Matte Art", gsm: 200, description: "Non-reflective premium", priceMultiplier: 1.35 },
  { id: "photo-gloss", label: "Photo Glossy Paper", gsm: 260, description: "Photo-quality finish", priceMultiplier: 2 },
  { id: "photo-matte", label: "Photo Matte Paper", gsm: 260, description: "Photo-quality non-glossy", priceMultiplier: 2 },
  { id: "canvas", label: "Canvas Texture", gsm: 300, description: "Art canvas look and feel", priceMultiplier: 3 },
  { id: "backlit", label: "Backlit Film", gsm: 0, description: "For light boxes", priceMultiplier: 3.5 },
];

// ═══════════════════════════════════════════════
// BANNERS & FLEX
// ═══════════════════════════════════════════════
const bannerSizes: PrintSize[] = [
  { id: "ban-2x3", label: "2 × 3 ft", dimensions: "610 × 914 mm", widthMM: 610, heightMM: 914, widthInch: "24", heightInch: "36", basePrice: 150 },
  { id: "ban-3x4", label: "3 × 4 ft", dimensions: "914 × 1219 mm", widthMM: 914, heightMM: 1219, widthInch: "36", heightInch: "48", basePrice: 250 },
  { id: "ban-4x6", label: "4 × 6 ft", dimensions: "1219 × 1829 mm", widthMM: 1219, heightMM: 1829, widthInch: "48", heightInch: "72", basePrice: 450 },
  { id: "ban-5x3", label: "5 × 3 ft", dimensions: "1524 × 914 mm", widthMM: 1524, heightMM: 914, widthInch: "60", heightInch: "36", basePrice: 350 },
  { id: "ban-6x3", label: "6 × 3 ft", dimensions: "1829 × 914 mm", widthMM: 1829, heightMM: 914, widthInch: "72", heightInch: "36", basePrice: 400 },
  { id: "ban-8x4", label: "8 × 4 ft", dimensions: "2438 × 1219 mm", widthMM: 2438, heightMM: 1219, widthInch: "96", heightInch: "48", basePrice: 700 },
  { id: "ban-10x5", label: "10 × 5 ft", dimensions: "3048 × 1524 mm", widthMM: 3048, heightMM: 1524, widthInch: "120", heightInch: "60", basePrice: 1100 },
  { id: "ban-custom", label: "Custom Size", dimensions: "Per sq ft pricing", widthMM: 0, heightMM: 0, widthInch: "Custom", heightInch: "Custom", basePrice: 18 },
];

const bannerPapers: PaperType[] = [
  { id: "star-flex", label: "Star Flex", gsm: 0, description: "Economy flex, front-lit", priceMultiplier: 1 },
  { id: "normal-flex", label: "Normal Flex", gsm: 0, description: "Standard quality flex banner", priceMultiplier: 1.2 },
  { id: "eco-solvent", label: "Eco-Solvent Flex", gsm: 0, description: "Better colors, weather resistant", priceMultiplier: 1.5 },
  { id: "vinyl-banner", label: "Vinyl Banner", gsm: 0, description: "Durable outdoor vinyl", priceMultiplier: 1.8 },
  { id: "backlit-flex", label: "Backlit Flex", gsm: 0, description: "Translucent, for light boxes", priceMultiplier: 2 },
  { id: "one-way-vision", label: "One Way Vision", gsm: 0, description: "Perforated window film", priceMultiplier: 2.5 },
  { id: "fabric-banner", label: "Fabric/Cloth Banner", gsm: 0, description: "Premium cloth look", priceMultiplier: 3 },
  { id: "mesh-banner", label: "Mesh Banner", gsm: 0, description: "Wind-perforated outdoor", priceMultiplier: 1.8 },
];

// ═══════════════════════════════════════════════
// STICKERS & LABELS
// ═══════════════════════════════════════════════
const stickerSizes: PrintSize[] = [
  { id: "stk-2x2", label: "2 × 2 inch", dimensions: "51 × 51 mm", widthMM: 51, heightMM: 51, widthInch: "2", heightInch: "2", basePrice: 2 },
  { id: "stk-3x3", label: "3 × 3 inch", dimensions: "76 × 76 mm", widthMM: 76, heightMM: 76, widthInch: "3", heightInch: "3", basePrice: 3 },
  { id: "stk-4x4", label: "4 × 4 inch", dimensions: "102 × 102 mm", widthMM: 102, heightMM: 102, widthInch: "4", heightInch: "4", basePrice: 4 },
  { id: "stk-a4-sheet", label: "A4 Sticker Sheet", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 15 },
  { id: "stk-circle-2", label: "Circle 2 inch", dimensions: "51 mm diameter", widthMM: 51, heightMM: 51, widthInch: "2", heightInch: "2", basePrice: 2 },
  { id: "stk-circle-3", label: "Circle 3 inch", dimensions: "76 mm diameter", widthMM: 76, heightMM: 76, widthInch: "3", heightInch: "3", basePrice: 3 },
  { id: "stk-custom", label: "Custom Die-Cut", dimensions: "Custom shape", widthMM: 0, heightMM: 0, widthInch: "Custom", heightInch: "Custom", basePrice: 5 },
];

const stickerPapers: PaperType[] = [
  { id: "vinyl-gloss", label: "Glossy Vinyl", gsm: 0, description: "Durable, waterproof, shiny", priceMultiplier: 1 },
  { id: "vinyl-matte", label: "Matte Vinyl", gsm: 0, description: "Durable, waterproof, non-glossy", priceMultiplier: 1.1 },
  { id: "paper-gloss", label: "Glossy Paper", gsm: 80, description: "Economy indoor sticker", priceMultiplier: 0.7 },
  { id: "paper-matte", label: "Matte Paper", gsm: 80, description: "Non-glossy paper sticker", priceMultiplier: 0.7 },
  { id: "transparent", label: "Transparent Vinyl", gsm: 0, description: "Clear background sticker", priceMultiplier: 1.5 },
  { id: "holographic", label: "Holographic", gsm: 0, description: "Rainbow shimmer effect", priceMultiplier: 2.5 },
  { id: "kraft-sticker", label: "Kraft Paper", gsm: 80, description: "Eco-friendly brown paper", priceMultiplier: 1.2 },
  { id: "removable", label: "Removable Vinyl", gsm: 0, description: "Easy peel, no residue", priceMultiplier: 1.3 },
];

// ═══════════════════════════════════════════════
// ID CARDS
// ═══════════════════════════════════════════════
const idCardSizes: PrintSize[] = [
  { id: "id-cr80-l", label: "CR80 Standard (Landscape)", dimensions: "86 × 54 mm", widthMM: 86, heightMM: 54, widthInch: "3.38", heightInch: "2.13", basePrice: 25 },
  { id: "id-cr80-p", label: "CR80 Standard (Portrait)", dimensions: "54 × 86 mm", widthMM: 54, heightMM: 86, widthInch: "2.13", heightInch: "3.38", basePrice: 25 },
  { id: "id-cr79-l", label: "CR79 (Landscape)", dimensions: "84 × 52 mm", widthMM: 84, heightMM: 52, widthInch: "3.31", heightInch: "2.05", basePrice: 30 },
  { id: "id-cr79-p", label: "CR79 (Portrait)", dimensions: "52 × 84 mm", widthMM: 52, heightMM: 84, widthInch: "2.05", heightInch: "3.31", basePrice: 30 },
];

const idCardPapers: PaperType[] = [
  { id: "pvc-076", label: "PVC 0.76mm", gsm: 0, description: "Standard credit card thickness", priceMultiplier: 1 },
  { id: "pvc-030", label: "PVC 0.30mm (Thin)", gsm: 0, description: "Thin, flexible PVC", priceMultiplier: 0.7 },
  { id: "pvc-050", label: "PVC 0.50mm", gsm: 0, description: "Medium thickness", priceMultiplier: 0.85 },
  { id: "teslin", label: "Teslin (Waterproof)", gsm: 0, description: "Tear-resistant, waterproof", priceMultiplier: 1.5 },
  { id: "composite", label: "Composite PVC", gsm: 0, description: "Premium multi-layer PVC", priceMultiplier: 1.8 },
];

// ═══════════════════════════════════════════════
// LETTERHEADS & ENVELOPES
// ═══════════════════════════════════════════════
const letterheadSizes: PrintSize[] = [
  { id: "lh-a4", label: "A4", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 5 },
  { id: "lh-letter", label: "Letter", dimensions: "216 × 279 mm", widthMM: 216, heightMM: 279, widthInch: "8.5", heightInch: "11", basePrice: 5 },
  { id: "lh-legal", label: "Legal", dimensions: "216 × 356 mm", widthMM: 216, heightMM: 356, widthInch: "8.5", heightInch: "14", basePrice: 6 },
];

// ═══════════════════════════════════════════════
// INVITATIONS & WEDDING CARDS
// ═══════════════════════════════════════════════
const invitationSizes: PrintSize[] = [
  { id: "inv-standard", label: "Standard", dimensions: "170 × 120 mm", widthMM: 170, heightMM: 120, widthInch: "6.7", heightInch: "4.7", basePrice: 15 },
  { id: "inv-square", label: "Square", dimensions: "150 × 150 mm", widthMM: 150, heightMM: 150, widthInch: "5.9", heightInch: "5.9", basePrice: 18 },
  { id: "inv-large", label: "Large", dimensions: "200 × 150 mm", widthMM: 200, heightMM: 150, widthInch: "7.9", heightInch: "5.9", basePrice: 20 },
  { id: "inv-a5", label: "A5", dimensions: "148 × 210 mm", widthMM: 148, heightMM: 210, widthInch: "5.8", heightInch: "8.3", basePrice: 18 },
  { id: "inv-scroll", label: "Scroll Card", dimensions: "203 × 114 mm (rolled)", widthMM: 203, heightMM: 114, widthInch: "8", heightInch: "4.5", basePrice: 50 },
  { id: "inv-acrylic", label: "Acrylic Invitation", dimensions: "127 × 178 mm", widthMM: 127, heightMM: 178, widthInch: "5", heightInch: "7", basePrice: 250 },
];

const hospitalSizes: PrintSize[] = [
  { id: "hosp-bill-a5", label: "Bill Book A5", dimensions: "148 × 210 mm", widthMM: 148, heightMM: 210, widthInch: "5.8", heightInch: "8.3", basePrice: 120 },
  { id: "hosp-bill-dl", label: "Bill Book DL", dimensions: "99 × 210 mm", widthMM: 99, heightMM: 210, widthInch: "3.9", heightInch: "8.3", basePrice: 90 },
  { id: "hosp-record-a4", label: "Patient File A4", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 45 },
  { id: "hosp-pres-a5", label: "Prescription Pad A5", dimensions: "148 × 210 mm", widthMM: 148, heightMM: 210, widthInch: "5.8", heightInch: "8.3", basePrice: 35 },
];

const hospitalPapers: PaperType[] = [
  { id: "ncr-2-part", label: "NCR 2-Part (Duplicate)", gsm: 0, description: "Carbonless duplicate paper", priceMultiplier: 1 },
  { id: "ncr-3-part", label: "NCR 3-Part (Triplicate)", gsm: 0, description: "Carbonless triplicate paper", priceMultiplier: 1.5 },
  { id: "bond-100", label: "100 GSM Ledger Bond", gsm: 100, description: "Durable ledger paper", priceMultiplier: 1.2 },
];

// ═══════════════════════════════════════════════
// PACKAGING & BOXES
// ═══════════════════════════════════════════════
const packagingSizes: PrintSize[] = [
  { id: "pkg-small", label: "Small Box", dimensions: "100 × 100 × 50 mm", widthMM: 100, heightMM: 100, widthInch: "4", heightInch: "4", basePrice: 25 },
  { id: "pkg-medium", label: "Medium Box", dimensions: "200 × 150 × 80 mm", widthMM: 200, heightMM: 150, widthInch: "8", heightInch: "6", basePrice: 45 },
  { id: "pkg-large", label: "Large Box", dimensions: "300 × 250 × 120 mm", widthMM: 300, heightMM: 250, widthInch: "12", heightInch: "10", basePrice: 75 },
  { id: "pkg-paper-bag-s", label: "Paper Bag Small", dimensions: "200 × 150 × 80 mm", widthMM: 200, heightMM: 150, widthInch: "8", heightInch: "6", basePrice: 15 },
  { id: "pkg-paper-bag-l", label: "Paper Bag Large", dimensions: "300 × 250 × 120 mm", widthMM: 300, heightMM: 250, widthInch: "12", heightInch: "10", basePrice: 25 },
];

// ═══════════════════════════════════════════════
// STANDEES & ROLLUPS
// ═══════════════════════════════════════════════
const standeeSizes: PrintSize[] = [
  { id: "std-rollup-sm", label: "Roll-Up 2.5 × 6 ft", dimensions: "762 × 1829 mm", widthMM: 762, heightMM: 1829, widthInch: "30", heightInch: "72", basePrice: 899 },
  { id: "std-rollup-md", label: "Roll-Up 3 × 6 ft", dimensions: "914 × 1829 mm", widthMM: 914, heightMM: 1829, widthInch: "36", heightInch: "72", basePrice: 999 },
  { id: "std-rollup-lg", label: "Roll-Up 4 × 7 ft", dimensions: "1219 × 2134 mm", widthMM: 1219, heightMM: 2134, widthInch: "48", heightInch: "84", basePrice: 1299 },
  { id: "std-cutout", label: "Custom Cutout", dimensions: "5-6 ft height", widthMM: 0, heightMM: 1524, widthInch: "Custom", heightInch: "60", basePrice: 1999 },
  { id: "std-x-banner", label: "X-Banner 2 × 5 ft", dimensions: "610 × 1524 mm", widthMM: 610, heightMM: 1524, widthInch: "24", heightInch: "60", basePrice: 499 },
];

// ═══════════════════════════════════════════════
// CERTIFICATES & AWARDS
// ═══════════════════════════════════════════════
const certificateSizes: PrintSize[] = [
  { id: "cert-a4", label: "A4 Certificate", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 20 },
  { id: "cert-a3", label: "A3 Certificate", dimensions: "297 × 420 mm", widthMM: 297, heightMM: 420, widthInch: "11.7", heightInch: "16.5", basePrice: 35 },
  { id: "cert-letter", label: "Letter Size", dimensions: "216 × 279 mm", widthMM: 216, heightMM: 279, widthInch: "8.5", heightInch: "11", basePrice: 20 },
];

// ═══════════════════════════════════════════════
// T-SHIRT & MERCHANDISE PRINTING
// ═══════════════════════════════════════════════
const merchandiseSizes: PrintSize[] = [
  { id: "merch-a4-print", label: "A4 Print Area", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 150 },
  { id: "merch-a3-print", label: "A3 Print Area", dimensions: "297 × 420 mm", widthMM: 297, heightMM: 420, widthInch: "11.7", heightInch: "16.5", basePrice: 200 },
  { id: "merch-pocket", label: "Pocket Print", dimensions: "100 × 100 mm", widthMM: 100, heightMM: 100, widthInch: "4", heightInch: "4", basePrice: 100 },
];

// ═══════════════════════════════════════════════
// NOTEPADS & DIARIES
// ═══════════════════════════════════════════════
const notepadSizes: PrintSize[] = [
  { id: "np-a5", label: "A5 Notepad", dimensions: "148 × 210 mm", widthMM: 148, heightMM: 210, widthInch: "5.8", heightInch: "8.3", basePrice: 35 },
  { id: "np-a4", label: "A4 Notepad", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 50 },
  { id: "np-pocket", label: "Pocket Notepad", dimensions: "90 × 140 mm", widthMM: 90, heightMM: 140, widthInch: "3.5", heightInch: "5.5", basePrice: 25 },
  { id: "np-diary-a5", label: "A5 Diary", dimensions: "148 × 210 mm", widthMM: 148, heightMM: 210, widthInch: "5.8", heightInch: "8.3", basePrice: 120 },
];

// ═══════════════════════════════════════════════
// MENU CARDS
// ═══════════════════════════════════════════════
const menuCardSizes: PrintSize[] = [
  { id: "menu-a4-single", label: "A4 Single Page", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 45 },
  { id: "menu-a4-bifold", label: "A4 Bi-Fold", dimensions: "210 × 297 mm → 148 × 210 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 85 },
  { id: "menu-a3-bifold", label: "A3 Bi-Fold", dimensions: "297 × 420 mm → 210 × 297 mm", widthMM: 297, heightMM: 420, widthInch: "11.7", heightInch: "16.5", basePrice: 145 },
  { id: "menu-tent", label: "Table Tent", dimensions: "100 × 150 mm", widthMM: 100, heightMM: 150, widthInch: "4", heightInch: "6", basePrice: 35 },
];

const menuPapers: PaperType[] = [
  { id: "art-300-lam", label: "300 GSM Laminated", gsm: 300, description: "Standard menu, spill-resistant", priceMultiplier: 1 },
  { id: "synthetic-non-tear", label: "Synthetic Non-Tearable", gsm: 0, description: "100% waterproof and durable", priceMultiplier: 2.5 },
  { id: "textured-350", label: "350 GSM Textured", gsm: 350, description: "Premium feel, elegant look", priceMultiplier: 1.8 },
];

// ═══════════════════════════════════════════════
// CALENDARS
// ═══════════════════════════════════════════════
const calendarSizes: PrintSize[] = [
  { id: "cal-desk", label: "Desk Calendar (A5)", dimensions: "210 × 148 mm", widthMM: 210, heightMM: 148, widthInch: "8.3", heightInch: "5.8", basePrice: 199 },
  { id: "cal-wall-a3", label: "Wall Calendar (A3)", dimensions: "297 × 420 mm", widthMM: 297, heightMM: 420, widthInch: "11.7", heightInch: "16.5", basePrice: 399 },
  { id: "cal-wall-a2", label: "Wall Calendar (A2)", dimensions: "420 × 594 mm", widthMM: 420, heightMM: 594, widthInch: "16.5", heightInch: "23.4", basePrice: 599 },
  { id: "cal-pocket", label: "Pocket Calendar", dimensions: "89 × 54 mm", widthMM: 89, heightMM: 54, widthInch: "3.5", heightInch: "2.1", basePrice: 10 },
];

// ═══════════════════════════════════════════════
// COMMON DATA
// ═══════════════════════════════════════════════
const commonFinishes: FinishType[] = [
  { id: "none", label: "No Finish", description: "Standard", priceAdd: 0 },
  { id: "glossy-lam", label: "Glossy Lamination", description: "Protective shiny layer", priceAdd: 1 },
  { id: "matte-lam", label: "Matte Lamination", description: "Smooth matte coating", priceAdd: 1.2 },
];

const bannerFinishes: FinishType[] = [
  { id: "none", label: "No Finish", description: "Standard print", priceAdd: 0 },
  { id: "eyelets", label: "Eyelets/Grommets", description: "Metal holes for hanging", priceAdd: 20 },
  { id: "hemming", label: "Hemming", description: "Folded edge reinforcement", priceAdd: 30 },
  { id: "pole-pocket", label: "Pole Pocket", description: "Sleeve for pole insertion", priceAdd: 50 },
];

const printingMethodsDigital: PrintingMethod[] = [
  { id: "digital", label: "Digital Printing", description: "Best for small runs, fast turnaround" },
  { id: "offset", label: "Offset Printing", description: "Best for large runs, superior quality" },
];

const printingMethodsLargeFormat: PrintingMethod[] = [
  { id: "eco-solvent", label: "Eco-Solvent Printing", description: "Standard outdoor printing" },
  { id: "uv-print", label: "UV Printing", description: "Vibrant, immediate dry, weather resistant" },
  { id: "latex", label: "Latex Printing", description: "Eco-friendly, odorless" },
];

const printingMethodsMerch: PrintingMethod[] = [
  { id: "dtg", label: "DTG (Direct to Garment)", description: "Full color prints on fabric" },
  { id: "screen", label: "Screen Printing", description: "Bulk orders, vibrant colors" },
  { id: "sublimation", label: "Sublimation", description: "Full-wrap, permanent, polyester" },
  { id: "vinyl-heat", label: "Vinyl Heat Transfer", description: "Durable, bold graphics" },
];

// ═══════════════════════════════════════════════
// MASTER CATALOG
// ═══════════════════════════════════════════════
export const productCategories: ProductCategory[] = [
  {
    id: "visiting-cards",
    name: "Visiting Cards",
    description: "Professional business cards for every occasion",
    icon: "ContactRound",
    subcategories: [
      {
        id: "standard-visiting-card", name: "Standard Visiting Card", description: "Classic business card, most popular in India",
        image: "/assets/products/premium_visiting_cards_mockup_1775247422194.png",
        startingPrice: "₹249", unit: "per 100 cards", minQty: 100, popular: true,
        sizes: visitingCardSizes.filter(s => ["vc-standard", "vc-indian"].includes(s.id)),
        papers: visitingCardPapers.slice(0, 4), finishes: visitingCardFinishes.slice(0, 5),
        quantityTiers: [
          { min: 100, max: 999, pricePerUnit: 2.49 },
          { min: 1000, max: 1999, pricePerUnit: 2.24 }, // -10% (2.49 * 0.9 = 2.241)
          { min: 2000, max: 4999, pricePerUnit: 2.11 }, // -15% (2.49 * 0.85 = 2.1165)
          { min: 5000, max: 99999, pricePerUnit: 1.86 }, // -25% (2.49 * 0.75 = 1.8675)
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "2-3",
      },
      {
        id: "premium-visiting-card", name: "Premium Visiting Card", description: "Luxury cards with special finishes",
        image: "/assets/products/gold_foil_visiting_card_mockup_1775247458938.png",
        startingPrice: "₹5", unit: "per card", minQty: 50, popular: true,
        sizes: visitingCardSizes, papers: visitingCardPapers, finishes: visitingCardFinishes,
        quantityTiers: [
          { min: 50, max: 99, pricePerUnit: 5 }, { min: 100, max: 249, pricePerUnit: 4 },
          { min: 250, max: 499, pricePerUnit: 3.5 }, { min: 500, max: 9999, pricePerUnit: 3 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "3-5",
      },
      {
        id: "transparent-visiting-card", name: "Transparent PVC Card", description: "Modern see-through plastic cards",
        startingPrice: "₹10", unit: "per card", minQty: 50,
        sizes: [visitingCardSizes[0]], papers: [visitingCardPapers[5]], finishes: [visitingCardFinishes[0]],
        quantityTiers: [
          { min: 50, max: 99, pricePerUnit: 10 }, { min: 100, max: 249, pricePerUnit: 8 },
          { min: 250, max: 999, pricePerUnit: 7 },
        ],
        printingMethods: [{ id: "uv-print", label: "UV Printing", description: "Direct UV print on PVC" }],
        turnaroundDays: "5-7",
      },
    ],
  },
  {
    id: "flyers",
    name: "Flyers & Leaflets",
    description: "Effective marketing materials for promotions",
    icon: "FileText",
    subcategories: [
      {
        id: "standard-flyer", name: "Standard Flyer", description: "Single or double-sided promotional flyers",
        image: "/assets/products/flyer_branded.png",
        startingPrice: "₹2", unit: "per piece", minQty: 50, popular: true,
        sizes: flyerSizes, papers: flyerPapers, finishes: flyerFinishes,
        quantityTiers: [
          { min: 50, max: 99, pricePerUnit: 3 }, { min: 100, max: 249, pricePerUnit: 2.5 },
          { min: 250, max: 499, pricePerUnit: 2 }, { min: 500, max: 9999, pricePerUnit: 1.5 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "2-3",
      },
      {
        id: "door-hanger", name: "Door Hanger", description: "Die-cut flyers for door handles",
        startingPrice: "₹5", unit: "per piece", minQty: 100,
        sizes: [{ id: "dh-std", label: "Standard", dimensions: "89 × 216 mm", widthMM: 89, heightMM: 216, widthInch: "3.5", heightInch: "8.5", basePrice: 5 }],
        papers: flyerPapers.slice(1, 4), finishes: flyerFinishes,
        quantityTiers: [
          { min: 100, max: 249, pricePerUnit: 5 }, { min: 250, max: 499, pricePerUnit: 4 },
          { min: 500, max: 9999, pricePerUnit: 3 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "3-5",
      },
    ],
  },
  {
    id: "pamphlets",
    name: "Pamphlets & Brochures",
    description: "Multi-fold informational prints",
    icon: "BookOpen",
    subcategories: [
      {
        id: "bifold-brochure", name: "Bi-Fold Brochure", description: "4-panel folded brochure",
        image: "/assets/products/pamphlet_branded.png",
        startingPrice: "₹6", unit: "per piece", minQty: 50, popular: true,
        sizes: pamphletSizes.filter(s => s.id.includes("bifold")),
        papers: flyerPapers.slice(1, 6), finishes: flyerFinishes,
        quantityTiers: [
          { min: 50, max: 99, pricePerUnit: 8 }, { min: 100, max: 249, pricePerUnit: 6 },
          { min: 250, max: 499, pricePerUnit: 5 }, { min: 500, max: 9999, pricePerUnit: 4 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "3-5",
      },
      {
        id: "trifold-brochure", name: "Tri-Fold Brochure", description: "6-panel folded brochure, most popular",
        image: "/assets/products/pamphlet_branded.png",
        startingPrice: "₹7", unit: "per piece", minQty: 50, popular: true,
        sizes: pamphletSizes.filter(s => s.id.includes("trifold") || s.id.includes("z-fold")),
        papers: flyerPapers.slice(1, 6), finishes: flyerFinishes,
        quantityTiers: [
          { min: 50, max: 99, pricePerUnit: 10 }, { min: 100, max: 249, pricePerUnit: 7 },
          { min: 250, max: 499, pricePerUnit: 6 }, { min: 500, max: 9999, pricePerUnit: 5 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "3-5",
      },
    ],
  },
  {
    id: "posters",
    name: "Posters",
    description: "Eye-catching wall posters in all sizes",
    icon: "GalleryVerticalEnd",
    subcategories: [
      {
        id: "standard-poster", name: "Standard Poster", description: "Vibrant posters from A4 to A0",
        image: "/assets/products/poster_branded.png",
        startingPrice: "₹25", unit: "each", minQty: 1, popular: true,
        sizes: posterSizes, papers: posterPapers, finishes: commonFinishes,
        quantityTiers: [
          { min: 1, max: 4, pricePerUnit: 49 }, { min: 5, max: 9, pricePerUnit: 40 },
          { min: 10, max: 49, pricePerUnit: 30 }, { min: 50, max: 999, pricePerUnit: 25 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "2-4",
      },
      {
        id: "photo-poster", name: "Photo Poster", description: "High-quality photo prints",
        startingPrice: "₹99", unit: "each", minQty: 1,
        sizes: posterSizes.slice(0, 5), papers: posterPapers.filter(p => p.id.includes("photo") || p.id === "canvas"),
        finishes: [{ id: "none", label: "No Finish", description: "Standard", priceAdd: 0 }, { id: "matte-lam", label: "Matte Lamination", description: "Anti-glare", priceAdd: 20 }],
        quantityTiers: [
          { min: 1, max: 4, pricePerUnit: 99 }, { min: 5, max: 9, pricePerUnit: 79 },
          { min: 10, max: 99, pricePerUnit: 59 },
        ],
        printingMethods: [{ id: "digital-photo", label: "Digital Photo Print", description: "Lab-quality photo printing" }],
        turnaroundDays: "3-5",
      },
    ],
  },
  {
    id: "banners",
    name: "Banners & Flex",
    description: "Large format outdoor and indoor banners",
    icon: "RectangleHorizontal",
    subcategories: [
      {
        id: "flex-banner", name: "Flex Banner", description: "Standard outdoor flex printing",
        startingPrice: "₹12", unit: "per sq ft", minQty: 1, popular: true,
        sizes: bannerSizes, papers: bannerPapers.slice(0, 4), finishes: bannerFinishes,
        quantityTiers: [
          { min: 1, max: 9, pricePerUnit: 18 }, { min: 10, max: 49, pricePerUnit: 15 },
          { min: 50, max: 999, pricePerUnit: 12 },
        ],
        printingMethods: printingMethodsLargeFormat, turnaroundDays: "1-2",
      },
      {
        id: "vinyl-banner", name: "Vinyl Banner", description: "Premium durable vinyl banners",
        image: "/assets/products/banner_branded.png",
        startingPrice: "₹25", unit: "per sq ft", minQty: 1,
        sizes: bannerSizes.slice(0, 6), papers: [bannerPapers[3], bannerPapers[6]], finishes: bannerFinishes,
        quantityTiers: [
          { min: 1, max: 9, pricePerUnit: 30 }, { min: 10, max: 49, pricePerUnit: 25 },
          { min: 50, max: 999, pricePerUnit: 20 },
        ],
        printingMethods: printingMethodsLargeFormat, turnaroundDays: "2-3",
      },
    ],
  },
  {
    id: "stickers",
    name: "Stickers & Labels",
    description: "Custom stickers for branding and packaging",
    icon: "Sticker",
    subcategories: [
      {
        id: "die-cut-sticker", name: "Die-Cut Sticker", description: "Custom shaped stickers",
        image: "/assets/products/sticker_mockup_canva_style_1775247512635.png",
        startingPrice: "₹2", unit: "per piece", minQty: 50, popular: true,
        sizes: stickerSizes, papers: stickerPapers, finishes: commonFinishes,
        quantityTiers: [
          { min: 50, max: 99, pricePerUnit: 3 }, { min: 100, max: 249, pricePerUnit: 2 },
          { min: 250, max: 499, pricePerUnit: 1.5 }, { min: 500, max: 9999, pricePerUnit: 1 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "2-4",
      },
      {
        id: "sheet-sticker", name: "Sheet Stickers", description: "A4 sheets with multiple stickers",
        startingPrice: "₹15", unit: "per sheet", minQty: 10,
        sizes: [stickerSizes[3]], papers: stickerPapers.slice(0, 4), finishes: commonFinishes,
        quantityTiers: [
          { min: 10, max: 24, pricePerUnit: 15 }, { min: 25, max: 49, pricePerUnit: 12 },
          { min: 50, max: 99, pricePerUnit: 10 }, { min: 100, max: 999, pricePerUnit: 8 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "2-3",
      },
      {
        id: "product-label", name: "Product Labels", description: "Packaging and product labels",
        startingPrice: "₹1", unit: "per label", minQty: 100,
        sizes: stickerSizes.slice(0, 4), papers: stickerPapers.slice(0, 5), finishes: commonFinishes,
        quantityTiers: [
          { min: 100, max: 249, pricePerUnit: 2 }, { min: 250, max: 499, pricePerUnit: 1.5 },
          { min: 500, max: 999, pricePerUnit: 1 }, { min: 1000, max: 9999, pricePerUnit: 0.8 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "3-5",
      },
    ],
  },
  {
    id: "id-cards",
    name: "ID Cards",
    description: "PVC identity cards for organizations",
    icon: "IdCard",
    subcategories: [
      {
        id: "pvc-id-card", name: "PVC ID Card", description: "Standard plastic identity cards",
        image: "https://images.unsplash.com/photo-1581413809628-98e3b3a5fe6f?w=400&q=80",
        startingPrice: "₹25", unit: "per card", minQty: 1, popular: true,
        sizes: idCardSizes, papers: idCardPapers, finishes: [{ id: "none", label: "No Finish", description: "Standard", priceAdd: 0 }, { id: "matte", label: "Matte Surface", description: "Anti-glare", priceAdd: 5 }],
        quantityTiers: [
          { min: 1, max: 9, pricePerUnit: 35 }, { min: 10, max: 49, pricePerUnit: 25 },
          { min: 50, max: 99, pricePerUnit: 20 }, { min: 100, max: 999, pricePerUnit: 15 },
        ],
        printingMethods: [{ id: "dye-sub", label: "Dye-Sublimation", description: "Photo-quality card printing" }],
        turnaroundDays: "3-5",
      },
      {
        id: "smart-card", name: "Smart / NFC Card", description: "NFC-enabled digital business cards",
        startingPrice: "₹150", unit: "per card", minQty: 10,
        sizes: [idCardSizes[0]], papers: [idCardPapers[0]], finishes: [{ id: "none", label: "Standard", description: "With NFC chip", priceAdd: 0 }],
        quantityTiers: [
          { min: 10, max: 49, pricePerUnit: 150 }, { min: 50, max: 99, pricePerUnit: 120 },
          { min: 100, max: 999, pricePerUnit: 100 },
        ],
        printingMethods: [{ id: "uv-nfc", label: "UV Print + NFC", description: "UV printing with embedded NFC chip" }],
        turnaroundDays: "7-10",
      },
    ],
  },
  {
    id: "standees",
    name: "Standees & Roll-Ups",
    description: "Portable display stands for events and shops",
    icon: "Smartphone",
    subcategories: [
      {
        id: "rollup-standee", name: "Roll-Up Standee", description: "Retractable banner stands",
        startingPrice: "₹899", unit: "each", minQty: 1, popular: true,
        sizes: standeeSizes.filter(s => s.id.includes("rollup")),
        papers: [bannerPapers[3], { id: "pp-synthetic", label: "PP Synthetic Paper", gsm: 0, description: "Smooth, tear-resistant", priceMultiplier: 1 }],
        finishes: [{ id: "none", label: "Standard", description: "With aluminum stand", priceAdd: 0 }],
        quantityTiers: [
          { min: 1, max: 4, pricePerUnit: 999 }, { min: 5, max: 9, pricePerUnit: 899 },
          { min: 10, max: 99, pricePerUnit: 799 },
        ],
        printingMethods: printingMethodsLargeFormat, turnaroundDays: "2-4",
      },
      {
        id: "cutout-standee", name: "Custom Cutout", description: "Life-size or custom shape standees",
        startingPrice: "₹1999", unit: "each", minQty: 1,
        sizes: [standeeSizes[3]],
        papers: [{ id: "sunboard-5mm", label: "5mm Sunboard", gsm: 0, description: "Rigid foam board", priceMultiplier: 1 }],
        finishes: [{ id: "none", label: "Die-Cut", description: "Custom shape cutting", priceAdd: 0 }],
        quantityTiers: [
          { min: 1, max: 4, pricePerUnit: 1999 }, { min: 5, max: 9, pricePerUnit: 1799 },
          { min: 10, max: 99, pricePerUnit: 1499 },
        ],
        printingMethods: [{ id: "uv-flatbed", label: "UV Flatbed Printing", description: "Direct print on rigid substrate" }],
        turnaroundDays: "5-7",
      },
    ],
  },
  {
    id: "invitations",
    name: "Invitations & Wedding Cards",
    description: "Beautiful invitations for all occasions",
    icon: "Heart",
    subcategories: [
      {
        id: "wedding-card", name: "Wedding Invitation", description: "Traditional and modern wedding cards",
        startingPrice: "₹15", unit: "per card", minQty: 50, popular: true,
        sizes: invitationSizes, papers: [visitingCardPapers[2], visitingCardPapers[3], visitingCardPapers[4], visitingCardPapers[7]],
        finishes: visitingCardFinishes,
        quantityTiers: [
          { min: 50, max: 99, pricePerUnit: 25 }, { min: 100, max: 249, pricePerUnit: 20 },
          { min: 250, max: 499, pricePerUnit: 15 }, { min: 500, max: 9999, pricePerUnit: 12 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "5-7",
      },
      {
        id: "event-invite", name: "Event Invitation", description: "Corporate and party invitations",
        startingPrice: "₹10", unit: "per card", minQty: 25,
        sizes: invitationSizes.slice(0, 4), papers: visitingCardPapers.slice(0, 4), finishes: visitingCardFinishes.slice(0, 5),
        quantityTiers: [
          { min: 25, max: 49, pricePerUnit: 15 }, { min: 50, max: 99, pricePerUnit: 10 },
          { min: 100, max: 499, pricePerUnit: 8 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "3-5",
      },
    ],
  },
  {
    id: "letterheads",
    name: "Letterheads & Envelopes",
    description: "Professional corporate stationery",
    icon: "Mail",
    subcategories: [
      {
        id: "letterhead", name: "Letterhead", description: "Branded company letterheads",
        startingPrice: "₹5", unit: "per sheet", minQty: 100, popular: true,
        sizes: letterheadSizes,
        papers: [
          { id: "bond-90", label: "90 GSM Bond Paper", gsm: 90, description: "Standard letterhead paper", priceMultiplier: 1 },
          { id: "bond-100", label: "100 GSM Executive Bond", gsm: 100, description: "Premium weight", priceMultiplier: 1.3 },
          { id: "wove-100", label: "100 GSM Wove Paper", gsm: 100, description: "Smooth texture", priceMultiplier: 1.5 },
        ],
        finishes: [{ id: "none", label: "No Finish", description: "Standard", priceAdd: 0 }],
        quantityTiers: [
          { min: 100, max: 249, pricePerUnit: 5 }, { min: 250, max: 499, pricePerUnit: 4 },
          { min: 500, max: 999, pricePerUnit: 3 }, { min: 1000, max: 9999, pricePerUnit: 2.5 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "2-4",
      },
      {
        id: "envelope", name: "Envelope", description: "Printed envelopes for mailings",
        startingPrice: "₹4", unit: "per envelope", minQty: 100,
        sizes: [
          { id: "env-dl", label: "DL Envelope", dimensions: "110 × 220 mm", widthMM: 110, heightMM: 220, widthInch: "4.3", heightInch: "8.7", basePrice: 4 },
          { id: "env-c5", label: "C5 Envelope", dimensions: "162 × 229 mm", widthMM: 162, heightMM: 229, widthInch: "6.4", heightInch: "9", basePrice: 5 },
          { id: "env-a4", label: "A4 Envelope", dimensions: "229 × 324 mm", widthMM: 229, heightMM: 324, widthInch: "9", heightInch: "12.75", basePrice: 7 },
        ],
        papers: [{ id: "bond-100", label: "100 GSM White Bond", gsm: 100, description: "Standard envelope paper", priceMultiplier: 1 }],
        finishes: [{ id: "none", label: "Standard", description: "Printed envelope", priceAdd: 0 }],
        quantityTiers: [
          { min: 100, max: 249, pricePerUnit: 5 }, { min: 250, max: 499, pricePerUnit: 4 },
          { min: 500, max: 9999, pricePerUnit: 3 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "3-5",
      },
    ],
  },
  {
    id: "packaging",
    name: "Packaging & Boxes",
    description: "Custom printed boxes and paper bags",
    icon: "Package",
    subcategories: [
      {
        id: "product-box", name: "Product Box", description: "Custom printed packaging boxes",
        startingPrice: "₹25", unit: "per box", minQty: 50,
        sizes: packagingSizes.slice(0, 3),
        papers: [
          { id: "corrugated-3ply", label: "3-Ply Corrugated", gsm: 0, description: "Standard shipping box", priceMultiplier: 1 },
          { id: "corrugated-5ply", label: "5-Ply Corrugated", gsm: 0, description: "Heavy duty box", priceMultiplier: 1.5 },
          { id: "art-card-box", label: "350 GSM Art Card", gsm: 350, description: "Premium retail packaging", priceMultiplier: 2 },
        ],
        finishes: [
          { id: "none", label: "No Finish", description: "Standard kraft", priceAdd: 0 },
          { id: "glossy-lam", label: "Glossy Lamination", description: "Shiny premium look", priceAdd: 5 },
          { id: "matte-lam", label: "Matte Lamination", description: "Elegant matte finish", priceAdd: 6 },
        ],
        quantityTiers: [
          { min: 50, max: 99, pricePerUnit: 45 }, { min: 100, max: 249, pricePerUnit: 35 },
          { min: 250, max: 499, pricePerUnit: 25 }, { min: 500, max: 9999, pricePerUnit: 20 },
        ],
        printingMethods: [{ id: "offset", label: "Offset Printing", description: "Best for bulk box printing" }],
        turnaroundDays: "7-10",
      },
      {
        id: "paper-bag", name: "Paper Bag", description: "Branded carry bags",
        startingPrice: "₹15", unit: "per bag", minQty: 100,
        sizes: packagingSizes.slice(3),
        papers: [
          { id: "kraft-bag", label: "Kraft Paper", gsm: 200, description: "Classic brown bag", priceMultiplier: 1 },
          { id: "art-bag", label: "Art Paper", gsm: 200, description: "White coated bag", priceMultiplier: 1.5 },
        ],
        finishes: commonFinishes,
        quantityTiers: [
          { min: 100, max: 249, pricePerUnit: 20 }, { min: 250, max: 499, pricePerUnit: 15 },
          { min: 500, max: 9999, pricePerUnit: 12 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "7-10",
      },
    ],
  },
  {
    id: "certificates",
    name: "Certificates & Awards",
    description: "Professional certificates and award prints",
    icon: "Award",
    subcategories: [
      {
        id: "certificate", name: "Certificate", description: "Completion, appreciation, and recognition certificates",
        startingPrice: "₹20", unit: "each", minQty: 1, popular: true,
        sizes: certificateSizes,
        papers: [
          { id: "bond-120", label: "120 GSM Bond", gsm: 120, description: "Standard certificate paper", priceMultiplier: 1 },
          { id: "parchment", label: "Parchment Paper", gsm: 100, description: "Classic certificate texture", priceMultiplier: 1.5 },
          { id: "art-250", label: "250 GSM Art Card", gsm: 250, description: "Thick, premium", priceMultiplier: 1.8 },
        ],
        finishes: [
          { id: "none", label: "No Finish", description: "Standard", priceAdd: 0 },
          { id: "foil-gold", label: "Gold Foil Border", description: "Classic gold frame", priceAdd: 10 },
          { id: "emboss-seal", label: "Embossed Seal", description: "Raised official seal", priceAdd: 15 },
        ],
        quantityTiers: [
          { min: 1, max: 9, pricePerUnit: 30 }, { min: 10, max: 49, pricePerUnit: 20 },
          { min: 50, max: 99, pricePerUnit: 15 }, { min: 100, max: 999, pricePerUnit: 12 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "2-4",
      },
    ],
  },
  {
    id: "merchandise",
    name: "T-Shirts & Merchandise",
    description: "Custom printed apparel and merchandise",
    icon: "Shirt",
    subcategories: [
      {
        id: "tshirt-print", name: "T-Shirt Printing", description: "Custom printed t-shirts",
        startingPrice: "₹150", unit: "per piece", minQty: 1, popular: true,
        sizes: merchandiseSizes,
        papers: [
          { id: "cotton-180", label: "180 GSM Cotton", gsm: 180, description: "Standard cotton tee", priceMultiplier: 1 },
          { id: "cotton-220", label: "220 GSM Premium Cotton", gsm: 220, description: "Thick premium tee", priceMultiplier: 1.5 },
          { id: "polyester", label: "Polyester Blend", gsm: 160, description: "For sublimation prints", priceMultiplier: 1.2 },
        ],
        finishes: [{ id: "none", label: "Standard", description: "As printed", priceAdd: 0 }],
        quantityTiers: [
          { min: 1, max: 9, pricePerUnit: 250 }, { min: 10, max: 24, pricePerUnit: 200 },
          { min: 25, max: 49, pricePerUnit: 175 }, { min: 50, max: 999, pricePerUnit: 150 },
        ],
        printingMethods: printingMethodsMerch, turnaroundDays: "5-7",
      },
      {
        id: "mug-print", name: "Mug Printing", description: "Custom printed ceramic mugs",
        startingPrice: "₹120", unit: "per mug", minQty: 1,
        sizes: [{ id: "mug-11oz", label: "11 oz Standard", dimensions: "Standard coffee mug", widthMM: 0, heightMM: 0, widthInch: "11oz", heightInch: "Standard", basePrice: 120 }],
        papers: [{ id: "ceramic-white", label: "White Ceramic", gsm: 0, description: "Standard ceramic mug", priceMultiplier: 1 }, { id: "ceramic-magic", label: "Magic Mug (Color Change)", gsm: 0, description: "Changes color with heat", priceMultiplier: 2 }],
        finishes: [{ id: "none", label: "Standard", description: "Sublimation print", priceAdd: 0 }],
        quantityTiers: [
          { min: 1, max: 9, pricePerUnit: 150 }, { min: 10, max: 24, pricePerUnit: 120 },
          { min: 25, max: 99, pricePerUnit: 100 },
        ],
        printingMethods: [{ id: "sublimation", label: "Sublimation", description: "Heat transfer printing" }],
        turnaroundDays: "3-5",
      },
    ],
  },
  {
    id: "notepads",
    name: "Notepads & Diaries",
    description: "Custom branded stationery products",
    icon: "BookText",
    subcategories: [
      {
        id: "notepad", name: "Branded Notepad", description: "Custom printed notepads with logo",
        startingPrice: "₹25", unit: "per pad", minQty: 25,
        sizes: notepadSizes.slice(0, 3),
        papers: [
          { id: "bond-70", label: "70 GSM Bond", gsm: 70, description: "Standard writing paper", priceMultiplier: 1 },
          { id: "bond-80", label: "80 GSM Bond", gsm: 80, description: "Slightly thicker", priceMultiplier: 1.1 },
        ],
        finishes: [{ id: "none", label: "Standard", description: "50 sheets per pad", priceAdd: 0 }],
        quantityTiers: [
          { min: 25, max: 49, pricePerUnit: 40 }, { min: 50, max: 99, pricePerUnit: 35 },
          { min: 100, max: 499, pricePerUnit: 25 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "5-7",
      },
    ],
  },
  {
    id: "menu-cards",
    name: "Menu Cards",
    description: "Professional menus for restaurants and cafes",
    icon: "BookOpen",
    subcategories: [
      {
        id: "restaurant-menu", name: "Restaurant Menu", description: "Laminated or synthetic menu cards",
        startingPrice: "₹45", unit: "per menu", minQty: 10, popular: true,
        sizes: menuCardSizes, papers: menuPapers, finishes: commonFinishes,
        quantityTiers: [
          { min: 10, max: 49, pricePerUnit: 65 }, { min: 50, max: 99, pricePerUnit: 55 },
          { min: 100, max: 999, pricePerUnit: 45 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "3-5",
      },
    ],
  },
  {
    id: "calendars",
    name: "Calendars",
    description: "Custom calendars for year-round branding",
    icon: "Clock",
    subcategories: [
      {
        id: "desk-calendar", name: "Desk Calendar", description: "Personalized tent calendars",
        startingPrice: "₹199", unit: "per unit", minQty: 5, popular: true,
        sizes: [calendarSizes[0]],
        papers: [visitingCardPapers[1], visitingCardPapers[2]],
        finishes: [{ id: "wiro", label: "Wiro Binding", description: "Spiral wire binding", priceAdd: 0 }],
        quantityTiers: [
          { min: 5, max: 19, pricePerUnit: 299 }, { min: 20, max: 49, pricePerUnit: 249 },
          { min: 50, max: 999, pricePerUnit: 199 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "5-7",
      },
      {
        id: "wall-calendar", name: "Wall Calendar", description: "Multi-page wall calendars",
        startingPrice: "₹399", unit: "per unit", minQty: 5,
        sizes: [calendarSizes[1], calendarSizes[2]],
        papers: [flyerPapers[2], flyerPapers[3]],
        finishes: [{ id: "top-tinning", label: "Top Tinning", description: "Metal hanging clip", priceAdd: 0 }],
        quantityTiers: [
          { min: 5, max: 19, pricePerUnit: 499 }, { min: 20, max: 49, pricePerUnit: 449 },
          { min: 50, max: 999, pricePerUnit: 399 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "7-10",
      },
    ],
  },
  {
    id: "hospital-management",
    name: "Hospital & Medical",
    description: "Specialized printing for healthcare operations",
    icon: "Stethoscope",
    subcategories: [
      {
        id: "medical-bill-book", name: "Medical Bill Book", description: "Carbonless duplicate or triplicate bill books",
        startingPrice: "₹90", unit: "per book", minQty: 10,
        sizes: hospitalSizes.filter(s => s.id.includes("bill")),
        papers: hospitalPapers.filter(p => p.id.includes("ncr")),
        finishes: [{ id: "binding", label: "Book Binding", description: "Perforated with hard cover", priceAdd: 0 }],
        quantityTiers: [
          { min: 10, max: 24, pricePerUnit: 150 }, { min: 25, max: 49, pricePerUnit: 120 },
          { min: 50, max: 999, pricePerUnit: 90 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "4-6",
      },
      {
        id: "patient-file", name: "Patient Record File", description: "Durable folders for medical history",
        startingPrice: "₹15", unit: "each", minQty: 100,
        sizes: [hospitalSizes[2]],
        papers: [visitingCardPapers[1], visitingCardPapers[2]],
        finishes: [{ id: "none", label: "Standard", description: "With file clip", priceAdd: 0 }],
        quantityTiers: [
          { min: 100, max: 249, pricePerUnit: 25 }, { min: 250, max: 499, pricePerUnit: 18 },
          { min: 500, max: 9999, pricePerUnit: 15 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "5-7",
      },
    ],
  },
  {
    id: "premium-weddings",
    name: "Luxury Weddings",
    description: "High-end stationery for the perfect celebration",
    icon: "Sparkles",
    subcategories: [
      {
        id: "laser-cut-wedding", name: "Laser-Cut Invitation", description: "Intricate laser-cut designs on premium paper",
        startingPrice: "₹85", unit: "per card", minQty: 50, popular: true,
        sizes: invitationSizes.slice(0, 4),
        papers: [visitingCardPapers[3], visitingCardPapers[4], visitingCardPapers[7]],
        finishes: [visitingCardFinishes[4], { id: "laser-cut", label: "Laser Cutting", description: "Complex die-cut patterns", priceAdd: 40 }],
        quantityTiers: [
          { min: 50, max: 99, pricePerUnit: 150 }, { min: 100, max: 249, pricePerUnit: 120 },
          { min: 250, max: 999, pricePerUnit: 85 },
        ],
        printingMethods: printingMethodsDigital, turnaroundDays: "10-14",
      },
    ],
  },
  // ═══════════════════════════════════════════════
  // STUDENT PROJECTS & BOOK BINDING
  // ═══════════════════════════════════════════════
  {
    id: "student-projects",
    name: "Student Projects & Binding",
    description: "Affordable printing and binding for academic submissions",
    icon: "BookOpen",
    subcategories: [
      {
        id: "spiral-binding", name: "Spiral Binding", description: "Durable plastic spiral binding for reports and presentations",
        startingPrice: "₹30", unit: "per copy", minQty: 1, popular: true,
        sizes: [
          { id: "sp-a4", label: "A4", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 30 },
          { id: "sp-a3", label: "A3", dimensions: "297 × 420 mm", widthMM: 297, heightMM: 420, widthInch: "11.7", heightInch: "16.5", basePrice: 60 },
          { id: "sp-legal", label: "Legal", dimensions: "216 × 356 mm", widthMM: 216, heightMM: 356, widthInch: "8.5", heightInch: "14", basePrice: 35 },
        ],
        papers: [
          { id: "bond-80", label: "80 GSM Bond Paper", gsm: 80, description: "Standard B&W print paper", priceMultiplier: 1 },
          { id: "bond-100", label: "100 GSM Bond Paper", gsm: 100, description: "Thicker pages, less show-through", priceMultiplier: 1.2 },
        ],
        finishes: [
          { id: "transparent-cover", label: "Transparent Front Cover", description: "Clear PVC front + black back", priceAdd: 10 },
          { id: "color-cover", label: "Colored Front Cover", description: "Opaque colored front cover", priceAdd: 15 },
        ],
        quantityTiers: [
          { min: 1, max: 4, pricePerUnit: 50 }, { min: 5, max: 9, pricePerUnit: 40 },
          { min: 10, max: 99, pricePerUnit: 30 },
        ],
        printingMethods: [{ id: "digital", label: "Digital Printing", description: "Laser or inkjet for small runs" }],
        turnaroundDays: "1-2",
      },
      {
        id: "hardcover-binding", name: "Hardcover Binding", description: "Professional hardbound thesis and project reports with gold/silver embossing",
        startingPrice: "₹150", unit: "per copy", minQty: 1, popular: true,
        sizes: [
          { id: "hb-a4", label: "A4 Hardbound", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 150 },
        ],
        papers: [
          { id: "bond-80", label: "80 GSM Bond Paper", gsm: 80, description: "Standard pages", priceMultiplier: 1 },
          { id: "bond-100", label: "100 GSM Bond Paper", gsm: 100, description: "Premium pages", priceMultiplier: 1.3 },
        ],
        finishes: [
          { id: "gold-emboss", label: "Gold Letter Embossing", description: "University name & title in gold foil", priceAdd: 80 },
          { id: "silver-emboss", label: "Silver Letter Embossing", description: "Silver foil title", priceAdd: 80 },
          { id: "plain", label: "Plain Cover (No Emboss)", description: "Solid rexine cover only", priceAdd: 0 },
        ],
        quantityTiers: [
          { min: 1, max: 2, pricePerUnit: 250 }, { min: 3, max: 5, pricePerUnit: 200 },
          { min: 6, max: 20, pricePerUnit: 150 },
        ],
        printingMethods: [{ id: "digital", label: "Digital + Letterpress", description: "Print + embossed cover" }],
        turnaroundDays: "2-4",
      },
      {
        id: "softcover-binding", name: "Softcover / Perfect Binding", description: "Glue-bound soft cover reports and manuals",
        startingPrice: "₹60", unit: "per copy", minQty: 1,
        sizes: [
          { id: "sc-a4", label: "A4", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 60 },
          { id: "sc-a5", label: "A5 (Half size)", dimensions: "148 × 210 mm", widthMM: 148, heightMM: 210, widthInch: "5.8", heightInch: "8.3", basePrice: 45 },
        ],
        papers: [
          { id: "bond-80", label: "80 GSM Bond Paper", gsm: 80, description: "Standard", priceMultiplier: 1 },
          { id: "gloss-130", label: "130 GSM Gloss Art (color pages)", gsm: 130, description: "For color-heavy pages", priceMultiplier: 1.5 },
        ],
        finishes: [
          { id: "glossy-cover", label: "Glossy Laminated Cover", description: "300 GSM glossy cover", priceAdd: 20 },
          { id: "matte-cover", label: "Matte Laminated Cover", description: "300 GSM matte cover", priceAdd: 25 },
        ],
        quantityTiers: [
          { min: 1, max: 4, pricePerUnit: 90 }, { min: 5, max: 9, pricePerUnit: 75 },
          { min: 10, max: 50, pricePerUnit: 60 },
        ],
        printingMethods: [{ id: "digital", label: "Digital Printing", description: "Short run printing & binding" }],
        turnaroundDays: "2-3",
      },
      {
        id: "mini-project-report", name: "Mini Project Report", description: "Complete A4 printing + spiral binding for semester mini projects",
        startingPrice: "₹40", unit: "per copy", minQty: 1, popular: true,
        sizes: [
          { id: "mpr-a4", label: "A4 (up to 50 pages)", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 40 },
          { id: "mpr-a4-100", label: "A4 (51-100 pages)", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 70 },
          { id: "mpr-a4-200", label: "A4 (101-200 pages)", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 120 },
        ],
        papers: [
          { id: "bond-70", label: "70 GSM Bond Paper", gsm: 70, description: "Economy paper", priceMultiplier: 0.8 },
          { id: "bond-80", label: "80 GSM Bond Paper", gsm: 80, description: "Standard", priceMultiplier: 1 },
        ],
        finishes: [
          { id: "spiral-transparent", label: "Spiral + Transparent Cover", description: "Standard student cover", priceAdd: 10 },
        ],
        quantityTiers: [
          { min: 1, max: 2, pricePerUnit: 60 }, { min: 3, max: 9, pricePerUnit: 50 },
          { min: 10, max: 99, pricePerUnit: 40 },
        ],
        printingMethods: [{ id: "digital", label: "Digital Printing", description: "Laser print single/double sided" }],
        turnaroundDays: "1",
      },
      {
        id: "major-project-thesis", name: "Major Project / Thesis", description: "Complete printing + hardbound binding with embossed cover for final year projects & PhD thesis",
        startingPrice: "₹250", unit: "per copy", minQty: 1, popular: true,
        sizes: [
          { id: "thesis-a4", label: "A4 Thesis (up to 150 pages)", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 250 },
          { id: "thesis-a4-300", label: "A4 Thesis (151-300 pages)", dimensions: "210 × 297 mm", widthMM: 210, heightMM: 297, widthInch: "8.3", heightInch: "11.7", basePrice: 400 },
        ],
        papers: [
          { id: "bond-80", label: "80 GSM Bond Paper", gsm: 80, description: "Standard thesis paper", priceMultiplier: 1 },
          { id: "bond-100", label: "100 GSM Bond Paper", gsm: 100, description: "Premium pages", priceMultiplier: 1.3 },
        ],
        finishes: [
          { id: "gold-emboss", label: "Gold Embossed Hardcover", description: "Navy/Maroon rexine with gold letters", priceAdd: 100 },
          { id: "silver-emboss", label: "Silver Embossed Hardcover", description: "Black rexine with silver letters", priceAdd: 100 },
          { id: "cd-pocket", label: "CD Pocket (back cover)", description: "For project CD/DVD", priceAdd: 30 },
        ],
        quantityTiers: [
          { min: 1, max: 2, pricePerUnit: 350 }, { min: 3, max: 5, pricePerUnit: 300 },
          { min: 6, max: 20, pricePerUnit: 250 },
        ],
        printingMethods: [{ id: "digital", label: "Digital + Letterpress", description: "Full printing + hardcover binding" }],
        turnaroundDays: "3-5",
      },
    ],
  },
  // ═══════════════════════════════════════════════
  // INSTAGRAM TRENDING PRODUCTS (2025-2026)
  // ═══════════════════════════════════════════════
  {
    id: "instagram-trending",
    name: "Instagram Trending",
    description: "Viral products that Indian print shops sell via Instagram reels",
    icon: "TrendingUp",
    subcategories: [
      {
        id: "acrylic-photo-frame", name: "Acrylic Photo Frame", description: "UV printed photo on crystal-clear acrylic with LED base — #1 trending reel product",
        startingPrice: "₹299", unit: "per piece", minQty: 1, popular: true,
        sizes: [
          { id: "acr-6x6", label: "6×6 inch", dimensions: "152 × 152 mm", widthMM: 152, heightMM: 152, widthInch: "6", heightInch: "6", basePrice: 299 },
          { id: "acr-8x10", label: "8×10 inch", dimensions: "203 × 254 mm", widthMM: 203, heightMM: 254, widthInch: "8", heightInch: "10", basePrice: 499 },
          { id: "acr-12x12", label: "12×12 inch", dimensions: "305 × 305 mm", widthMM: 305, heightMM: 305, widthInch: "12", heightInch: "12", basePrice: 799 },
          { id: "acr-heart", label: "Heart Shape", dimensions: "200 × 200 mm", widthMM: 200, heightMM: 200, widthInch: "8", heightInch: "8", basePrice: 599 },
        ],
        papers: [
          { id: "acrylic-3mm", label: "3mm Clear Acrylic", gsm: 0, description: "Standard thickness", priceMultiplier: 1 },
          { id: "acrylic-5mm", label: "5mm Premium Acrylic", gsm: 0, description: "Thick luxe feel", priceMultiplier: 1.5 },
        ],
        finishes: [
          { id: "led-base", label: "LED Light Base", description: "Color-changing LED wooden base", priceAdd: 150 },
          { id: "wooden-stand", label: "Wooden Easel Stand", description: "Natural wood display stand", priceAdd: 80 },
          { id: "no-base", label: "No Base (Wall Mount)", description: "3M adhesive wall mount", priceAdd: 0 },
        ],
        quantityTiers: [
          { min: 1, max: 4, pricePerUnit: 499 }, { min: 5, max: 14, pricePerUnit: 399 },
          { min: 15, max: 99, pricePerUnit: 299 },
        ],
        printingMethods: [{ id: "uv", label: "UV Flatbed Printing", description: "Direct UV print on acrylic" }],
        turnaroundDays: "3-5",
      },
      {
        id: "custom-neon-sign", name: "Custom Neon Sign", description: "LED neon flex signs for rooms, cafes, and events — hugely viral on Instagram",
        startingPrice: "₹999", unit: "per sign", minQty: 1, popular: true,
        sizes: [
          { id: "neon-12", label: "12 inch wide", dimensions: "305 mm", widthMM: 305, heightMM: 150, widthInch: "12", heightInch: "6", basePrice: 999 },
          { id: "neon-18", label: "18 inch wide", dimensions: "457 mm", widthMM: 457, heightMM: 225, widthInch: "18", heightInch: "9", basePrice: 1499 },
          { id: "neon-24", label: "24 inch wide", dimensions: "610 mm", widthMM: 610, heightMM: 300, widthInch: "24", heightInch: "12", basePrice: 2499 },
          { id: "neon-36", label: "36 inch wide", dimensions: "914 mm", widthMM: 914, heightMM: 450, widthInch: "36", heightInch: "18", basePrice: 3999 },
        ],
        papers: [
          { id: "neon-flex", label: "LED Neon Flex", gsm: 0, description: "Silicone LED tubes on acrylic base", priceMultiplier: 1 },
        ],
        finishes: [
          { id: "clear-acrylic", label: "Clear Acrylic Backing", description: "Transparent background", priceAdd: 0 },
          { id: "black-acrylic", label: "Black Acrylic Backing", description: "Opaque dark backdrop", priceAdd: 200 },
          { id: "dimmer", label: "Dimmer Switch", description: "Adjustable brightness", priceAdd: 150 },
        ],
        quantityTiers: [
          { min: 1, max: 2, pricePerUnit: 2499 }, { min: 3, max: 9, pricePerUnit: 1999 },
          { min: 10, max: 49, pricePerUnit: 1499 },
        ],
        printingMethods: [{ id: "led-fab", label: "LED Fabrication", description: "Custom bent LED neon flex" }],
        turnaroundDays: "5-7",
      },
      {
        id: "custom-keychain", name: "Custom Photo Keychain", description: "Resin or acrylic keychains with UV-printed photos — popular gifting product on reels",
        startingPrice: "₹49", unit: "per keychain", minQty: 5, popular: true,
        sizes: [
          { id: "key-circle", label: "Circle (45mm)", dimensions: "45 mm", widthMM: 45, heightMM: 45, widthInch: "1.8", heightInch: "1.8", basePrice: 49 },
          { id: "key-rect", label: "Rectangle (50×35mm)", dimensions: "50 × 35 mm", widthMM: 50, heightMM: 35, widthInch: "2", heightInch: "1.4", basePrice: 59 },
          { id: "key-heart", label: "Heart Shape", dimensions: "45 × 40 mm", widthMM: 45, heightMM: 40, widthInch: "1.8", heightInch: "1.6", basePrice: 59 },
        ],
        papers: [
          { id: "acrylic-keychain", label: "Clear Acrylic", gsm: 0, description: "UV printed on acrylic", priceMultiplier: 1 },
          { id: "resin-keychain", label: "Resin (Epoxy Dome)", gsm: 0, description: "3D dome finish", priceMultiplier: 1.5 },
          { id: "wood-keychain", label: "Wooden", gsm: 0, description: "Laser engraved wood", priceMultiplier: 1.3 },
        ],
        finishes: [
          { id: "no-finish", label: "Standard", description: "Direct print", priceAdd: 0 },
          { id: "glitter", label: "Glitter Resin", description: "Sparkle effect", priceAdd: 20 },
        ],
        quantityTiers: [
          { min: 5, max: 19, pricePerUnit: 79 }, { min: 20, max: 49, pricePerUnit: 59 },
          { min: 50, max: 999, pricePerUnit: 49 },
        ],
        printingMethods: [{ id: "uv", label: "UV Printing", description: "Direct to substrate" }],
        turnaroundDays: "3-5",
      },
      {
        id: "custom-mug", name: "Custom Photo Mug", description: "Sublimation printed ceramic mugs — evergreen Instagram gift product",
        startingPrice: "₹149", unit: "per mug", minQty: 1, popular: true,
        sizes: [
          { id: "mug-11oz", label: "11 oz Standard", dimensions: "330 ml", widthMM: 95, heightMM: 82, widthInch: "3.7", heightInch: "3.2", basePrice: 149 },
          { id: "mug-15oz", label: "15 oz Large", dimensions: "450 ml", widthMM: 105, heightMM: 95, widthInch: "4.1", heightInch: "3.7", basePrice: 199 },
          { id: "mug-magic", label: "Magic Color-Changing Mug", dimensions: "330 ml", widthMM: 95, heightMM: 82, widthInch: "3.7", heightInch: "3.2", basePrice: 249 },
        ],
        papers: [
          { id: "ceramic-white", label: "White Ceramic", gsm: 0, description: "Standard glossy white", priceMultiplier: 1 },
          { id: "ceramic-inner-color", label: "Inner Color Ceramic", gsm: 0, description: "White outside, colored inside", priceMultiplier: 1.2 },
        ],
        finishes: [
          { id: "gift-box", label: "Gift Box Packaging", description: "Foam-lined box with window", priceAdd: 50 },
          { id: "no-box", label: "Standard (Bubble Wrap)", description: "Safe shipping wrap", priceAdd: 0 },
        ],
        quantityTiers: [
          { min: 1, max: 4, pricePerUnit: 199 }, { min: 5, max: 14, pricePerUnit: 169 },
          { min: 15, max: 99, pricePerUnit: 149 },
        ],
        printingMethods: [{ id: "sublimation", label: "Sublimation Printing", description: "Heat transfer to ceramic" }],
        turnaroundDays: "2-3",
      },
      {
        id: "phone-case-custom", name: "Custom Phone Case", description: "UV printed personalized phone cases — top-selling Instagram product",
        startingPrice: "₹199", unit: "per case", minQty: 1,
        sizes: [
          { id: "case-iphone15", label: "iPhone 15 / 15 Pro / Pro Max", dimensions: "Various", widthMM: 77, heightMM: 158, widthInch: "3", heightInch: "6.2", basePrice: 199 },
          { id: "case-samsung-s24", label: "Samsung S24 / S24 Ultra", dimensions: "Various", widthMM: 79, heightMM: 162, widthInch: "3.1", heightInch: "6.4", basePrice: 199 },
          { id: "case-oneplus", label: "OnePlus / Realme / Redmi", dimensions: "Various", widthMM: 75, heightMM: 160, widthInch: "3", heightInch: "6.3", basePrice: 149 },
        ],
        papers: [
          { id: "hard-case", label: "Hard Polycarbonate", gsm: 0, description: "Rigid snap-on case", priceMultiplier: 1 },
          { id: "soft-case", label: "Soft TPU", gsm: 0, description: "Flexible silicone case", priceMultiplier: 0.9 },
          { id: "glass-case", label: "Tempered Glass Back", gsm: 0, description: "Premium glass back case", priceMultiplier: 1.5 },
        ],
        finishes: [
          { id: "matte-finish", label: "Matte Finish", description: "Smooth matte texture", priceAdd: 0 },
          { id: "glossy-finish", label: "High Gloss", description: "Shiny finish", priceAdd: 20 },
        ],
        quantityTiers: [
          { min: 1, max: 4, pricePerUnit: 249 }, { min: 5, max: 14, pricePerUnit: 199 },
          { min: 15, max: 99, pricePerUnit: 149 },
        ],
        printingMethods: [{ id: "uv", label: "UV Flatbed Printing", description: "Direct print on case" }],
        turnaroundDays: "2-4",
      },
      {
        id: "resin-art-print", name: "Resin Art Photo Print", description: "Epoxy resin coated photo prints — premium 3D glass-like finish trending on Instagram",
        startingPrice: "₹399", unit: "per piece", minQty: 1,
        sizes: [
          { id: "resin-8x8", label: "8×8 inch", dimensions: "203 × 203 mm", widthMM: 203, heightMM: 203, widthInch: "8", heightInch: "8", basePrice: 399 },
          { id: "resin-10x10", label: "10×10 inch", dimensions: "254 × 254 mm", widthMM: 254, heightMM: 254, widthInch: "10", heightInch: "10", basePrice: 599 },
          { id: "resin-12x18", label: "12×18 inch", dimensions: "305 × 457 mm", widthMM: 305, heightMM: 457, widthInch: "12", heightInch: "18", basePrice: 999 },
        ],
        papers: [
          { id: "mdf-board", label: "MDF Board + Photo", gsm: 0, description: "Photo on MDF with resin top coat", priceMultiplier: 1 },
          { id: "wood-board", label: "Natural Wood Board", gsm: 0, description: "Rustic wood base", priceMultiplier: 1.3 },
        ],
        finishes: [
          { id: "clear-resin", label: "Clear Epoxy Resin", description: "Crystal clear glass effect", priceAdd: 0 },
          { id: "glitter-resin", label: "Glitter Resin", description: "Sparkle particles embedded", priceAdd: 100 },
        ],
        quantityTiers: [
          { min: 1, max: 4, pricePerUnit: 599 }, { min: 5, max: 14, pricePerUnit: 499 },
          { min: 15, max: 49, pricePerUnit: 399 },
        ],
        printingMethods: [{ id: "digital-resin", label: "Digital Print + Resin Coat", description: "High-res print with hand-poured resin" }],
        turnaroundDays: "5-7",
      },
      {
        id: "canvas-wall-art", name: "Canvas Wall Art", description: "Gallery-wrapped canvas prints — home decor bestseller on Instagram",
        startingPrice: "₹349", unit: "per piece", minQty: 1,
        sizes: [
          { id: "canv-8x12", label: "8×12 inch", dimensions: "203 × 305 mm", widthMM: 203, heightMM: 305, widthInch: "8", heightInch: "12", basePrice: 349 },
          { id: "canv-12x18", label: "12×18 inch", dimensions: "305 × 457 mm", widthMM: 305, heightMM: 457, widthInch: "12", heightInch: "18", basePrice: 599 },
          { id: "canv-16x24", label: "16×24 inch", dimensions: "406 × 610 mm", widthMM: 406, heightMM: 610, widthInch: "16", heightInch: "24", basePrice: 899 },
          { id: "canv-24x36", label: "24×36 inch", dimensions: "610 × 914 mm", widthMM: 610, heightMM: 914, widthInch: "24", heightInch: "36", basePrice: 1499 },
        ],
        papers: [
          { id: "cotton-canvas", label: "Cotton Canvas", gsm: 380, description: "Premium artist-grade cotton", priceMultiplier: 1 },
          { id: "poly-canvas", label: "Polyester Canvas", gsm: 320, description: "Economy, vibrant colors", priceMultiplier: 0.8 },
        ],
        finishes: [
          { id: "gallery-wrap", label: "Gallery Wrap (1.5 inch depth)", description: "Photo wraps around edges", priceAdd: 0 },
          { id: "white-border", label: "White Border Wrap", description: "Clean white edge", priceAdd: 0 },
          { id: "float-frame", label: "Floating Frame", description: "Wooden floater frame", priceAdd: 300 },
        ],
        quantityTiers: [
          { min: 1, max: 4, pricePerUnit: 599 }, { min: 5, max: 9, pricePerUnit: 449 },
          { min: 10, max: 49, pricePerUnit: 349 },
        ],
        printingMethods: [{ id: "giclee", label: "Giclée Printing", description: "Archival inkjet on canvas" }],
        turnaroundDays: "3-5",
      },
      {
        id: "wooden-photo-plaque", name: "Wooden Photo Plaque", description: "UV printed photos on natural wood — rustic Instagram aesthetic",
        startingPrice: "₹249", unit: "per piece", minQty: 1,
        sizes: [
          { id: "wood-6x6", label: "6×6 inch", dimensions: "152 × 152 mm", widthMM: 152, heightMM: 152, widthInch: "6", heightInch: "6", basePrice: 249 },
          { id: "wood-8x10", label: "8×10 inch", dimensions: "203 × 254 mm", widthMM: 203, heightMM: 254, widthInch: "8", heightInch: "10", basePrice: 399 },
        ],
        papers: [
          { id: "birch-plywood", label: "Birch Plywood", gsm: 0, description: "Light natural wood grain", priceMultiplier: 1 },
          { id: "mdf-wood", label: "MDF Board", gsm: 0, description: "Smooth finish fiberboard", priceMultiplier: 0.8 },
        ],
        finishes: [
          { id: "matte-coat", label: "Matte Clear Coat", description: "Protected matte UV finish", priceAdd: 0 },
          { id: "no-coat", label: "Raw Wood (No Coat)", description: "Natural wood texture visible", priceAdd: 0 },
        ],
        quantityTiers: [
          { min: 1, max: 4, pricePerUnit: 399 }, { min: 5, max: 14, pricePerUnit: 299 },
          { min: 15, max: 49, pricePerUnit: 249 },
        ],
        printingMethods: [{ id: "uv", label: "UV Flatbed Printing", description: "Direct UV print on wood" }],
        turnaroundDays: "3-5",
      },
    ],
  },
];

// Utility functions
export const getAllSubcategories = (): (ProductSubcategory & { categoryId: string; categoryName: string })[] => {
  return productCategories.flatMap(cat =>
    cat.subcategories.map(sub => ({ ...sub, categoryId: cat.id, categoryName: cat.name }))
  );
};

export const getSubcategoryById = (subcategoryId: string) => {
  for (const cat of productCategories) {
    const sub = cat.subcategories.find(s => s.id === subcategoryId);
    if (sub) return { ...sub, categoryId: cat.id, categoryName: cat.name };
  }
  return null;
};

export const getCategoryById = (categoryId: string) => {
  return productCategories.find(c => c.id === categoryId);
};

export const getPopularProducts = () => {
  return getAllSubcategories().filter(s => s.popular);
};

// Printing types reference data
export const printingTypes = [
  { id: "digital", name: "Digital Printing", description: "Ideal for short runs (1-500 copies). Quick turnaround, variable data printing.", bestFor: "Visiting cards, small flyers, test prints" },
  { id: "offset", name: "Offset Printing", description: "Best for large runs (500+). Superior color consistency, cost-effective at scale.", bestFor: "Bulk flyers, brochures, magazines, packaging" },
  { id: "screen", name: "Screen Printing", description: "Vibrant colors on various substrates. Great for fabrics and merchandise.", bestFor: "T-shirts, bags, promotional items" },
  { id: "uv", name: "UV Printing", description: "Instant drying with UV light. Prints on rigid and flexible materials.", bestFor: "Acrylic, wood, glass, rigid signage" },
  { id: "large-format", name: "Large Format Printing", description: "Banners, hoardings, vehicle wraps. Uses eco-solvent or latex inks.", bestFor: "Flex banners, vinyl signage, wall graphics" },
  { id: "sublimation", name: "Sublimation Printing", description: "Dye-transfer for polyester fabrics and coated surfaces.", bestFor: "Mugs, t-shirts, phone cases, photo gifts" },
  { id: "dtg", name: "DTG (Direct to Garment)", description: "Full-color prints directly on cotton garments.", bestFor: "Custom t-shirts, small batch apparel" },
  { id: "letterpress", name: "Letterpress Printing", description: "Traditional pressed-in printing with tactile feel.", bestFor: "Premium business cards, wedding invitations" },
  { id: "foil-stamping", name: "Foil Stamping", description: "Metallic foil transfer for luxurious accents.", bestFor: "Business cards, certificates, packaging" },
  { id: "embossing", name: "Embossing/Debossing", description: "Raised or recessed designs for textured feel.", bestFor: "Letterheads, cards, packaging" },
];
