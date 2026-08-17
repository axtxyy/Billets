import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import RoomDetail from "./pages/RoomDetail";
import RoomSearchResults from "./pages/RoomSearchResults";
import Dining from "./pages/Dining";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Gallery from "./pages/Gallery";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact";
import Amenities from "./pages/Amenities";
import Offers from "./pages/Offers";
import MyBookings from "./pages/MyBookings";
import Login from "./pages/Login";
import Register from "./pages/Register";
// @ts-ignore
import FAQ from "./pages/FAQ";
// @ts-ignore
import Privacy from "./pages/Privacy";
// @ts-ignore
import Terms from "./pages/Terms";
import Layout from "./components/Layout";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "rooms", element: <Rooms /> },
      { path: "rooms/:roomId", element: <RoomDetail /> },
      { path: "search", element: <RoomSearchResults /> },
      { path: "dining", element: <Dining /> },
      { path: "events", element: <Events /> },
      { path: "events/:eventId", element: <EventDetail /> },
      { path: "gallery", element: <Gallery /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "amenities", element: <Amenities /> },
      { path: "offers", element: <Offers /> },
      { path: "faq", element: <FAQ /> },
      { path: "privacy", element: <Privacy /> },
      { path: "terms", element: <Terms /> },
    ],
  },
  {
    path: "/login",
    element: <PublicOnlyRoute><Login /></PublicOnlyRoute>,
  },
  {
    path: "/register",
    element: <PublicOnlyRoute><Register /></PublicOnlyRoute>,
  },
  {
    path: "/my-bookings",
    element: <ProtectedRoute><MyBookings /></ProtectedRoute>,
  },
]);