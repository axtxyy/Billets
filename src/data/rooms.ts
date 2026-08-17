import type { RoomDisplay } from "./roomTypes";

export const rooms: RoomDisplay[] = [
  {
    id: "2beds-combo",
    name: "2 Beds Combo (Free Cancellation)",
    description:
      "Fits 2 adults. Includes kitchenette access, free cancellation up to 24 hrs before check‑in.",
    price: 1598,
    originalPrice: 1998,
    taxesAndFees: 192,
    image: "/images/rooms/4 beds.avif",
    gallery: [
      "/images/rooms/4 beds.avif",
      "/images/rooms/Single Luxury.avif",
    ],
    features: ["2 Beds", "Free Cancellation", "Kitchenette", "Wi‑Fi"],
    capacity: 2,
    bedType: "2 Single Beds",
    cancellation: "Free cancellation till 24 hrs before check‑in",
    policies: [
      "Book with ₹0 payment – pay before 03 Sep, 11:59 PM IST to avoid auto‑cancellation",
      "100% Refundable",
    ],
  },
  {
    id: "8bed-dorm",
    name: "8‑Bed Mixed Dormitory (per bed)",
    description:
      "Shared dormitory with Wi‑Fi, private bathroom, mineral water, electronic safe, hot & cold water, toiletries.",
    price: 799,
    originalPrice: 999,
    taxesAndFees: 0,
    image: "/images/rooms/8 beds.avif",
    gallery: [
      "/images/rooms/8 beds.avif",
      "/images/rooms/Common Area.avif",
    ],
    features: ["8‑Bed Dorm", "Wi‑Fi", "Bathroom", "Free Cancellation"],
    capacity: 1,
    bedType: "Single Bed in 8‑bed dorm",
    cancellation: "Free cancellation till 24 hrs before check‑in",
    policies: [
      "Book with ₹0 payment – pay before 03 Sep, 11:59 PM IST to avoid auto‑cancellation",
      "100% Refundable",
    ],
  },
  {
    id: "6bed-dorm",
    name: "6‑Bed Mixed Dormitory (per bed)",
    description:
      "Shared dormitory with Wi‑Fi, private bathroom, mineral water, electronic safe, hot & cold water, toiletries.",
    price: 799,
    originalPrice: 999,
    taxesAndFees: 0,
    image: "/images/rooms/Common Area2.avif",
    gallery: [
      "/images/rooms/Common Area2.avif",
      "/images/rooms/Common Area3.avif",
    ],
    features: ["6‑Bed Dorm", "Wi‑Fi", "Bathroom", "Free Cancellation"],
    capacity: 1,
    bedType: "Single Bed in 6‑bed dorm",
    cancellation: "Free cancellation till 24 hrs before check‑in",
    policies: [
      "Book with ₹0 payment – pay before 03 Sep, 11:59 PM IST to avoid auto‑cancellation",
      "100% Refundable",
    ],
  },
  {
    id: "couple-room",
    name: "Couple Room (Double Bed)",
    description:
      "Private double‑bed room with Wi‑Fi, bathroom, electronic safe, hot & cold water, toiletries, towels. Free cancellation up to 24 hrs before check‑in.",
    price: 3199,
    originalPrice: 3999,
    taxesAndFees: 0,
    image: "/images/rooms/Single Luxury.avif",
    gallery: [
      "/images/rooms/Single Luxury.avif",
      "/images/rooms/View.webp",
    ],
    features: ["Double Bed", "Private Bathroom", "Free Cancellation", "Wi‑Fi"],
    capacity: 2,
    bedType: "Double Bed",
    cancellation: "Free cancellation till 24 hrs before check‑in",
    policies: [
      "Book with ₹0 payment – pay before 03 Sep, 11:59 PM IST to avoid auto‑cancellation",
      "100% Refundable",
    ],
  },
];