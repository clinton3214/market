export type Platform = "instagram" | "facebook" | "x" | "telegram"

export type Account = {
  id: string
  platform: Platform
  handle: string
  name: string
  followers: string
  category: string
  price: number
  verified: boolean
  engagement: string
}

export const platformMeta: Record<
  Platform,
  { label: string; blurb: string }
> = {
  instagram: { label: "Instagram", blurb: "Aesthetic & niche pages" },
  facebook: { label: "Facebook", blurb: "Pages, groups & aged profiles" },
  x: { label: "X", blurb: "Verified handles & audiences" },
  telegram: { label: "Telegram", blurb: "Channels & active groups" },
}

export const accounts: Account[] = [
  { id: "1", platform: "instagram", handle: "@travel.frames", name: "Travel Frames", followers: "182K", category: "Travel", price: 1450, verified: true, engagement: "6.2%" },
  { id: "2", platform: "x", handle: "@cryptodaily", name: "Crypto Daily", followers: "96.4K", category: "Finance", price: 980, verified: true, engagement: "4.1%" },
  { id: "3", platform: "facebook", handle: "Fitness Hub", name: "Fitness Hub", followers: "240K", category: "Fitness", price: 1120, verified: true, engagement: "3.4%" },
  { id: "4", platform: "instagram", handle: "@street.style", name: "Street Style", followers: "58.2K", category: "Fashion", price: 640, verified: true, engagement: "7.8%" },
  { id: "5", platform: "telegram", handle: "Alpha Signals", name: "Alpha Signals", followers: "72.5K", category: "Trading", price: 890, verified: false, engagement: "12.5%" },
  { id: "6", platform: "instagram", handle: "@foodie.diaries", name: "Foodie Diaries", followers: "314K", category: "Food", price: 2100, verified: true, engagement: "5.5%" },
  { id: "7", platform: "x", handle: "@techpulse", name: "Tech Pulse", followers: "128K", category: "Technology", price: 1340, verified: true, engagement: "3.9%" },
  { id: "8", platform: "telegram", handle: "Deal Drops", name: "Deal Drops", followers: "145K", category: "Deals", price: 760, verified: false, engagement: "9.3%" },
  { id: "9", platform: "facebook", handle: "Home & Garden", name: "Home & Garden", followers: "410K", category: "Lifestyle", price: 1680, verified: true, engagement: "2.8%" },
  { id: "10", platform: "instagram", handle: "@fit.motion", name: "Fit Motion", followers: "89.7K", category: "Fitness", price: 920, verified: true, engagement: "8.1%" },
  { id: "11", platform: "x", handle: "@marketwatchers", name: "Market Watchers", followers: "203K", category: "Finance", price: 2450, verified: true, engagement: "4.6%" },
  { id: "12", platform: "telegram", handle: "NFT Vault", name: "NFT Vault", followers: "51.2K", category: "Crypto", price: 540, verified: false, engagement: "11.2%" },
  { id: "13", platform: "instagram", handle: "@minimal.spaces", name: "Minimal Spaces", followers: "167K", category: "Design", price: 1290, verified: true, engagement: "6.7%" },
  { id: "14", platform: "facebook", handle: "Daily Motivation", name: "Daily Motivation", followers: "620K", category: "Motivation", price: 2900, verified: true, engagement: "3.1%" },
  { id: "15", platform: "x", handle: "@sportscentral", name: "Sports Central", followers: "154K", category: "Sports", price: 1580, verified: true, engagement: "5.2%" },
  { id: "16", platform: "telegram", handle: "Study Hub", name: "Study Hub", followers: "98.3K", category: "Education", price: 680, verified: false, engagement: "10.4%" },
  { id: "17", platform: "instagram", handle: "@auto.culture", name: "Auto Culture", followers: "221K", category: "Automotive", price: 1740, verified: true, engagement: "5.9%" },
  { id: "18", platform: "x", handle: "@aidigest", name: "AI Digest", followers: "78.9K", category: "Technology", price: 1050, verified: true, engagement: "4.4%" },
  { id: "19", platform: "facebook", handle: "Travel Deals", name: "Travel Deals", followers: "330K", category: "Travel", price: 1490, verified: true, engagement: "2.9%" },
  { id: "20", platform: "telegram", handle: "Movie Nights", name: "Movie Nights", followers: "187K", category: "Entertainment", price: 940, verified: false, engagement: "8.7%" },
  { id: "21", platform: "instagram", handle: "@beauty.lab", name: "Beauty Lab", followers: "276K", category: "Beauty", price: 1980, verified: true, engagement: "7.1%" },
  { id: "22", platform: "x", handle: "@founderstack", name: "Founder Stack", followers: "64.5K", category: "Startups", price: 870, verified: true, engagement: "5.6%" },
  { id: "23", platform: "facebook", handle: "Pet Lovers", name: "Pet Lovers", followers: "512K", category: "Pets", price: 2250, verified: true, engagement: "3.6%" },
  { id: "24", platform: "telegram", handle: "Coding Tips", name: "Coding Tips", followers: "112K", category: "Technology", price: 790, verified: false, engagement: "9.8%" },
]
