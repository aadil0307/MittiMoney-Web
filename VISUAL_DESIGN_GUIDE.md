# 🎨 VISUAL DESIGN GUIDE - MittiMoney

## Color Palette Reference

### Primary Gradients

#### Balance Cards (Vibrant Backgrounds)
```css
Cash in Hand:     from-amber-500 to-orange-600
Bank/UPI:         from-blue-600 to-indigo-700
Total Balance:    from-emerald-600 to-green-700
```

#### Quick Action Icons
```css
Voice Log:        from-accent to-orange-600
Debt Tree:        from-emerald-600 to-green-700
Savings Jars:     from-blue-600 to-indigo-700
MittiCommit:      from-purple-600 to-pink-600
Analytics:        from-cyan-600 to-blue-700
Bills:            from-amber-600 to-orange-700
AI Categories:    from-pink-600 to-rose-700
Goals:            from-violet-600 to-purple-700
```

#### Onboarding Steps
```css
Step 1 (Name):          from-primary to-accent
Step 2 (Income):        from-emerald-600 to-green-700
Step 3 (Balances):      from-amber-600 to-orange-700
Step 4 (Language):      from-violet-600 to-purple-700
Step 5 (Success):       from-emerald-600 to-green-700
```

#### Text Gradients
```css
Headers:          from-primary via-accent to-orange-600
Income Text:      from-green-600 to-emerald-600
Expense Text:     from-red-600 to-rose-600
Savings Text:     from-blue-600 to-indigo-600
Success Title:    from-emerald-600 via-green-600 to-teal-600
```

---

## Typography Scale

### Headers
```
Main Dashboard Title:     text-3xl md:text-4xl font-extrabold
Onboarding Welcome:       text-4xl md:text-5xl font-extrabold
Card Titles:              text-3xl md:text-3xl font-extrabold
Section Headers:          text-2xl md:text-3xl font-extrabold
Card Labels:              text-base font-semibold
```

### Body Text
```
Primary Values:           text-4xl font-extrabold
Secondary Values:         text-3xl font-extrabold
Descriptions:             text-base font-medium
Subtitles:                text-sm text-white/70
Labels:                   text-base font-semibold
```

### Inputs
```
Input Fields:             h-12 text-lg
Select Dropdowns:         h-12 text-base
Buttons:                  size="lg" (default h-11)
```

---

## Spacing System

### Cards
```
Padding (Mobile):         p-4 → p-5
Padding (Tablet):         p-5 → p-6
Padding (Desktop):        p-6 → p-8
Gaps (Cards):             gap-3 md:gap-4
Gaps (Grid):              gap-4 md:gap-6
```

### Containers
```
Max Width:                max-w-7xl (dashboard)
                          max-w-md (onboarding)
Page Padding:             p-4 md:p-6 lg:p-8
Section Spacing:          space-y-6 md:space-y-8
```

### Icons
```
Balance Card Icons:       w-12 h-12 (icon: w-6 h-6)
Quick Action Icons:       w-14 h-14 (icon: w-7 h-7)
Onboarding Icons:         w-20 h-20 (icon: w-10 h-10)
Success Icon:             w-24 h-24 (icon: w-14 h-14)
```

---

## Shadow Hierarchy

### Elevation Levels
```
Level 1 (Subtle):         shadow-lg
Level 2 (Default):        shadow-xl
Level 3 (Prominent):      shadow-2xl
Level 4 (Hover):          shadow-2xl + shadow-[color]/50
```

### Colored Shadows (On Hover)
```
Amber Card:               hover:shadow-amber-500/50
Blue Card:                hover:shadow-blue-500/50
Emerald Card:             hover:shadow-emerald-500/50
Purple Card:              hover:shadow-purple-500/50
```

---

## Border Radius

### Consistency
```
Cards:                    rounded-2xl → rounded-3xl
Icon Containers:          rounded-2xl → rounded-3xl
Buttons:                  rounded-lg (default)
Progress Bars:            rounded-full
Input Fields:             rounded-md (default)
```

---

## Animation Specifications

### Spring Animations
```javascript
type: "spring"
stiffness: 300
damping: 20 (default)
```

### Hover Effects
```javascript
// Cards
whileHover={{ y: -8, scale: 1.02 }}
transition={{ type: "spring", stiffness: 300 }}

// Buttons
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
```

### Entry Animations
```javascript
// Dashboard Cards
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.1 * index }}

// Onboarding Steps
initial={{ opacity: 0, x: 50, scale: 0.95 }}
animate={{ opacity: 1, x: 0, scale: 1 }}
transition={{ duration: 0.4, type: "spring", stiffness: 300 }}

// Icons
initial={{ scale: 0, rotate: -180 }}
animate={{ scale: 1, rotate: 0 }}
transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
```

### Continuous Animations
```javascript
// Pulse Effect
animate={{ scale: [1, 1.1, 1] }}
transition={{ duration: 2, repeat: Infinity }}

// Bounce
animate={{ y: [0, -10, 0] }}
transition={{ duration: 1, repeat: Infinity }}

// Rotate
animate={{ rotate: 360 }}
transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
```

---

## Glassmorphism Effect

### Formula
```css
Background:       bg-white/90 dark:bg-slate-800/90
Backdrop:         backdrop-blur-xl
Border:           border border-white/20 dark:border-slate-700/50
Shadow:           shadow-2xl
```

### Usage
```
- Header cards
- Onboarding cards
- Modal overlays
- Language switcher
- Icon containers (white/20 opacity)
```

---

## Gradient Overlays

### Decorative Blur Circles
```css
Circle 1:         top-20 right-20 w-96 h-96
                  from-primary/10 to-accent/10
                  blur-3xl animate-pulse

Circle 2:         bottom-20 left-20 w-96 h-96
                  from-emerald-500/10 to-blue-500/10
                  blur-3xl animate-pulse
                  animationDelay: 1s

Circle 3:         top-1/2 left-1/2 w-[800px] h-[800px]
                  from-amber-500/5 to-orange-500/5
                  blur-3xl
```

---

## Icon Guidelines

### Size Scale
```
Extra Small:      w-4 h-4 (in labels)
Small:            w-5 h-5 (in buttons)
Medium:           w-6 h-6 (balance cards)
Large:            w-7 h-7 (quick actions)
Extra Large:      w-10 h-10 (onboarding)
XXL:              w-14 h-14 (success)
```

### Color Usage
```
On Gradient BG:   text-white
On White BG:      Gradient icon badge
On Muted BG:      text-primary/text-accent
Status Icons:     text-green-600, text-red-600, text-amber-600
```

---

## Progress Bars

### Structure
```html
<div className="flex-1 h-2 bg-[color]-100 dark:bg-[color]-950 rounded-full overflow-hidden">
  <div className="h-full bg-gradient-to-r from-[color]-500 to-[color]-500 rounded-full" 
       style={{ width: '65%' }}>
  </div>
</div>
```

### Colors
```
Income:           green-100 / green-500
Expense:          red-100 / red-500
Savings:          blue-100 / blue-500
```

---

## Responsive Breakpoints

### Tailwind Defaults
```
sm:   640px   (mobile landscape)
md:   768px   (tablet portrait)
lg:   1024px  (tablet landscape / small desktop)
xl:   1280px  (desktop)
2xl:  1536px  (large desktop)
```

### Usage in Components
```
Dashboard Grid:
  grid-cols-1 md:grid-cols-3 lg:grid-cols-8

Card Padding:
  p-4 md:p-6 lg:p-8

Text Sizes:
  text-3xl md:text-4xl lg:text-5xl

Icons:
  w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
```

---

## Dark Mode Colors

### Background
```css
Light:            from-orange-50 via-amber-50 to-yellow-50
Dark:             from-slate-900 via-slate-800 to-slate-900
```

### Cards
```css
Light:            bg-white/90
Dark:             bg-slate-800/90
```

### Text
```css
Foreground:       text-foreground (auto-switches)
Muted:            text-muted-foreground
Headers:          Gradients work in both modes
```

### Borders
```css
Light:            border-[color]-200
Dark:             border-[color]-900/30
```

---

## Button Variants

### Primary (Gradient)
```css
className="bg-gradient-to-r from-primary to-accent 
           hover:from-primary/90 hover:to-accent/90 
           shadow-lg"
```

### Secondary (Outline)
```css
variant="outline" 
className="border-2"
```

### Success (Green)
```css
className="bg-gradient-to-r from-emerald-600 to-green-700 
           hover:from-emerald-700 hover:to-green-800"
```

### Danger (Red)
```css
className="bg-gradient-to-r from-red-600 to-rose-700
           hover:from-red-700 hover:to-rose-800"
```

---

## Emoji Usage

### Onboarding
```
Welcome:          💰 (money bag)
Success:          🎊 (confetti)
Celebration:      🎉 (party popper)
Greeting:         👋 (waving hand)
```

### Language Selector
```
Hindi:            🇮🇳
Marathi:          🇮🇳
Tamil:            🇮🇳
English:          🌍
```

---

## Loading States

### Dashboard
```html
<div className="w-16 h-16 border-4 border-primary/30 border-t-primary 
                rounded-full animate-spin">
</div>
<Wallet className="absolute w-8 h-8 text-primary animate-pulse" />
```

### Onboarding
```html
<Sparkles className="animate-rotate" />
```

### Bouncing Dots
```html
<div style={{ animationDelay: '0ms' }}>•</div>
<div style={{ animationDelay: '150ms' }}>•</div>
<div style={{ animationDelay: '300ms' }}>•</div>
```

---

## Z-Index Layers

```
Background Blur:      z-0
Content:              z-10
Header/Nav:           z-20
Dropdown:             z-30
Modal:                z-40
Toast:                z-50
```

---

## Accessibility

### Focus States
```css
Input:            focus-visible:ring-2 focus-visible:ring-primary
Button:           focus-visible:ring-2 focus-visible:ring-offset-2
```

### Touch Targets
```
Minimum:          44px × 44px (h-11 or larger)
Buttons:          h-11 (size="lg")
Inputs:           h-12
Select Items:     py-3
```

### Contrast
```
White on Gradient:      ✅ AAA
Gradient Text:          ✅ AA Large
Muted Text:             ✅ AA
```

---

## Performance Tips

### Optimizations Used
```
✅ transform instead of top/left
✅ will-change via Framer Motion
✅ backdrop-filter with hardware acceleration
✅ Staggered animations for perceived speed
✅ Spring physics for natural feel
```

### Avoid
```
❌ Excessive blur on multiple elements
❌ Simultaneous complex animations
❌ Large background images
❌ Too many drop shadows
```

---

**This guide ensures visual consistency across all components!** 🎨
