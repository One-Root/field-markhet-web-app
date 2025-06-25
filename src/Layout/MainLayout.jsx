import Footer from "../components/Footer";
import Topbar from "../components/Topbar";

const MainLayout = ({ children }) => {
  return (
    <div>
      <main className="flex-grow p-4 bg-gray-50">{children}</main>
    </div>
  );
};
export default MainLayout;
