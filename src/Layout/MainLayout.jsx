import Footer from "../components/Footer";
import Topbar from "../components/Topbar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-grow p-4 bg-gray-50">{children}</main>
      <Footer />
    </div>
  );
};
export default MainLayout;
