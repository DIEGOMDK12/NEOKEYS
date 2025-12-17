# Design Guidelines: Gaming E-Commerce Platform

## Design Approach
**Reference-Based**: Direct inspiration from ThunderKeys.com gaming marketplace aesthetic. Modern e-commerce platform with gaming-focused dark interface and high-contrast accents.

## Typography System
- **Headings**: Inter or Poppins (bold, 600-700 weight)
  - H1: text-4xl to text-5xl (Hero banners)
  - H2: text-2xl to text-3xl (Section titles)
  - H3: text-xl (Product titles, category headers)
- **Body**: Inter or system-ui (regular 400, medium 500)
  - Base: text-base (Product descriptions)
  - Small: text-sm (Metadata, prices, platform tags)
- **Accents**: Mono font for prices/discounts (JetBrains Mono or Roboto Mono)

## Layout & Spacing
**Spacing Units**: Tailwind units of 2, 4, 6, 8, and 16 (p-2, m-4, gap-6, py-8, my-16)

**Grid System**:
- Product cards: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
- Categories: grid-cols-2 md:grid-cols-4 (price tier sections)
- Container max-width: max-w-7xl with px-4 md:px-6

**Layout Structure**:
- Fixed sidebar (w-64) with categories on desktop, collapsible on mobile
- Top navigation bar (h-16) with logo, search, cart, user icons
- Main content area with generous padding (p-6 to p-8)

## Core Components

### Navigation
- **Header**: Fixed top bar, flex justify-between, items-center
  - Logo (left, h-8 to h-10)
  - Search bar (center, flex-grow max-w-2xl with rounded-lg)
  - Icons (right, cart badge with count, user profile)
- **Sidebar**: Sticky navigation with scrollable category list
  - Platform categories with icons (Steam, Epic, GOG, etc.)
  - Hover states with subtle shift

### Product Cards
- Aspect ratio 3:4 for game cover images
- Rounded corners (rounded-lg)
- Structure: Image → Title → Price row (original + discounted) → Platform badges
- Discount badge: Absolute positioned top-right corner
- Shadow on hover (hover:shadow-xl transition-shadow)
- Padding: p-3 to p-4

### Hero/Banner Section
- Full-width banner (w-full) with aspect-ratio 21:9 or h-96
- Promotional game image with overlay gradient
- Call-to-action button positioned center-left or bottom-left
- Text overlay with blur backdrop (backdrop-blur-sm)

### Shopping Cart
- Slide-out panel from right (w-96 on desktop, full-width mobile)
- Product list with thumbnail (w-16 h-16), title, price
- Quantity controls (+/- buttons)
- Sticky footer with total and checkout button
- Empty state with icon and message

### Forms (Login/Register)
- Centered modal or dedicated page (max-w-md mx-auto)
- Input fields: rounded-lg, p-3, full-width with focus states
- Social login buttons with platform icons
- Terms checkbox with link

## Images

### Hero/Banner Images
- Large promotional banners featuring trending games (1920x800px minimum)
- Positioned at top of homepage after navigation
- Should showcase key game artwork with dramatic lighting
- Overlay text on left/center with pricing and CTA button

### Product Images
- Game cover art in vertical format (460x215px or similar 3:4 ratio)
- High-quality official artwork
- Each product card displays one primary image
- Hover effect reveals platform compatibility badges

### Category Icons
- Platform logos (Steam, Epic, GOG, Rockstar, etc.) as SVG icons
- Use via icon library (Heroicons for UI, Font Awesome for platform brands)
- Size: w-5 h-5 for inline icons, w-8 h-8 for category cards

### Additional Visual Elements
- Discount/sale badges (small PNG overlays, corner ribbons)
- Payment method icons in footer (card logos)
- Loading states use placeholder gradient backgrounds

## Component Interactions

### Buttons
- Primary CTA: Rounded (rounded-lg), bold text, px-6 py-3
- Secondary: Outlined variant with border-2
- Icon buttons: Circular (rounded-full) p-2
- Backdrop blur on hero buttons (backdrop-blur-md bg-opacity-90)

### Cards & Containers
- Consistent rounded-lg corners
- Subtle borders or shadow elevation
- Hover states: scale-105 transform with transition-transform
- Click feedback: scale-95 on active

### Data Display
- Price display: Strikethrough original, emphasized discount
- Platform badges: Flex row with gap-2, rounded-full pills
- Rating/reviews: Star icons with count
- Stock status: Small badge (text-xs rounded-full px-2)

### Navigation States
- Active category: Highlighted with border-l-4 indicator
- Breadcrumbs: Flex row with separator icons (/)
- Pagination: Numbered buttons with prev/next arrows

## Responsive Behavior
- Mobile: Single column, sidebar becomes drawer menu
- Tablet: 2-3 column product grid, visible sidebar
- Desktop: 4-5 column grid, fixed sidebar + main content
- Breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px

## Accessibility
- Focus rings on all interactive elements (ring-2 ring-offset-2)
- Semantic HTML (nav, main, aside, article)
- Alt text for all product images
- Aria labels for icon-only buttons
- Keyboard navigation for cart and modals

## Special Features
- Floating chat button (bottom-right, rounded-full, fixed position)
- Badge notifications on cart icon (absolute, -top-1 -right-1)
- Sticky "Add to Cart" button on product detail pages
- Price filter sliders with range inputs
- Genre/category multi-select with checkboxes

**Animation**: Minimal - only subtle hover transforms and page transitions. No excessive motion.