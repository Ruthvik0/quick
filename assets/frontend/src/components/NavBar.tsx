import ThemeController from "./ThemeController";

const NavBar = () => {
  return (
    <nav className="navbar bg-base-100 shadow-md">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">Quick</a>
      </div>
      <div className="flex-none">
        <ThemeController />
      </div>
    </nav>
  );
};

export default NavBar;
